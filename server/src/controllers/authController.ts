import { Request, Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailService';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

export const requestOtp = async (req: Request, res: Response) => {
  const { phone, email, isRegistration } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone } });

    if (isRegistration && user) {
      return res.status(400).json({ message: 'Phone already registered.' });
    }
    if (!isRegistration && !user) {
      return res.status(404).json({ message: 'Phone not found. Please register.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    console.log(`[OTP] Generated ${code} for ${phone}`);

    // Persist OTP
    await prisma.otp.upsert({
      where: { phone },
      update: { code, expiresAt, attempts: 0 },
      create: { phone, code, expiresAt, attempts: 0 }
    });

    // Send via Email if provided (Registration) or if user has email (Login)
    let emailSent = false;
    const targetEmail = email || (user ? user.email : null);

    if (targetEmail) {
      try {
        await sendEmail(targetEmail, 'Your Verification Code', `Your OTP for NextGenHealth is: ${code}`);
        emailSent = true;
      } catch (err) {
        console.error("Failed to send email OTP", err);
      }
    }

    res.json({
      success: true,
      message: emailSent ? `OTP sent to ${targetEmail}` : 'OTP sent (Simulation checking required if no email credentials)'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Direct Register (No OTP)
export const register = async (req: Request, res: Response) => {
  const { phone, userData, password } = req.body;

  try {
    // Safety check: Ensure phone is not already registered
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone already registered.' });
    }

    const patientId = `PID${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const { address, gender, dob, age, govId, ...rest } = userData;

    const user = await prisma.user.create({
      data: {
        ...rest,
        phone,
        password: hashedPassword,
        role: 'PATIENT',
        addressStreet: address?.street || null,
        addressCity: address?.city || null,
        addressState: address?.state || null,
        addressPincode: address?.pincode || null,
        patientId,
        patientGender: gender || null,
        patientDob: dob || null,
        patientAge: age ? Number(age) : null,
        patientGovIdType: govId?.type || null,
        patientGovIdNumber: govId?.number || null,
        avatar: `https://ui-avatars.com/api/?name=${userData.name}`
      }
    });

    res.json({
      success: true,
      message: 'Registration successful. Please login.',
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error: any) {
    console.error("Register Error", error);
    res.status(500).json({ message: error.message || 'Registration error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { identifier } = req.body; // Email or Phone

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.email && !identifier.includes('@')) {
      return res.status(400).json({ message: 'No email associated with this account. Cannot reset password.' });
    }

    const targetEmail = user.email || (identifier.includes('@') ? identifier : null);

    if (!targetEmail) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.otp.upsert({
      where: { phone: user.phone },
      update: { code, expiresAt, attempts: 0 },
      create: { phone: user.phone, code, expiresAt, attempts: 0 }
    });

    await sendEmail(targetEmail, 'Password Reset Code', `Your password reset code is: ${code}`);

    res.json({ success: true, message: `Reset code sent to ${targetEmail}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { identifier, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }]
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpRecord = await prisma.otp.findUnique({ where: { phone: user.phone } });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    if (otpRecord.code !== otp) {
      await prisma.otp.update({
        where: { phone: user.phone },
        data: { attempts: otpRecord.attempts + 1 }
      });
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await prisma.otp.delete({ where: { phone: user.phone } });

    res.json({ success: true, message: 'Password reset successful. Please login.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp, userData } = req.body;
  try {
    const otpRecord = await prisma.otp.findUnique({ where: { phone } });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found.' });
    }

    if (otpRecord.attempts >= 3) {
      await prisma.otp.delete({ where: { phone } });
      return res.status(400).json({ message: 'Too many failed attempts. Request a new OTP.' });
    }

    if (otpRecord.code !== otp) {
      await prisma.otp.update({
        where: { phone },
        data: { attempts: otpRecord.attempts + 1 }
      });
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user && userData) {
      // Create user on successful registration OTP verification
      const patientId = `PID${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      const { address, gender, dob, age, govId, ...rest } = userData;

      user = await prisma.user.create({
        data: {
          ...rest,
          phone,
          role: 'PATIENT',
          addressStreet: address?.street || null,
          addressCity: address?.city || null,
          addressState: address?.state || null,
          addressPincode: address?.pincode || null,
          patientId,
          patientGender: gender || null,
          patientDob: dob || null,
          patientAge: age ? Number(age) : null,
          patientGovIdType: govId?.type || null,
          patientGovIdNumber: govId?.number || null,
          avatar: `https://ui-avatars.com/api/?name=${userData.name}`
        }
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cleanup OTP
    await prisma.otp.delete({ where: { phone } });

    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Verification error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { phone: email }]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found. Please check your credentials.' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'No password set for this account. Please use OTP login or reset password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Unauthorized role' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
