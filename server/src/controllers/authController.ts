
import { Request, Response } from 'express';
import { User, Otp } from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

import { sendEmail } from '../utils/emailService';

export const requestOtp = async (req: Request, res: Response) => {
  const { phone, email, isRegistration } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const user = await User.findOne({ phone });

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
    await Otp.findOneAndUpdate(
      { phone },
      { code, expiresAt, attempts: 0 },
      { upsert: true }
    );

    // Send via Email if provided (Registration) or if user has email (Login)
    let emailSent = false;
    const targetEmail = email || (user ? user.email : null);

    if (targetEmail) {
      try {
        await sendEmail(targetEmail, 'Your Verification Code', `Your OTP for NextGenHealth is: ${code}`);
        emailSent = true;
      } catch (err) {
        console.error("Failed to send email OTP", err);
        // Continue execution, don't fail just because email failed? 
        // Or warn user? Taking safe route: continue but log.
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
// Direct Register (No OTP)
export const register = async (req: Request, res: Response) => {
  const { phone, userData, password } = req.body;

  // Safety check: Ensure phone is not already registered
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ message: 'Phone already registered.' });
  }

  try {
    const patientId = `PID${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const { address, gender, dob, age, govId, ...rest } = userData;

    const user = await User.create({
      ...rest,
      phone,
      password: hashedPassword,
      role: 'PATIENT',
      address: address || {},
      patientDetails: {
        patientId,
        gender,
        dob,
        age,
        govId
      },
      avatar: `https://ui-avatars.com/api/?name=${userData.name}`
    });

    // We return success but NO token, forcing them to login
    res.json({
      success: true,
      message: 'Registration successful. Please login.',
      user: {
        id: user._id,
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
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Ideally send to email if present, else fallback or error?
    // Requirement says "send verification to reset password send to the email"
    if (!user.email && !identifier.includes('@')) {
      return res.status(400).json({ message: 'No email associated with this account. Cannot reset password.' });
    }

    const targetEmail = user.email || (identifier.includes('@') ? identifier : null);

    if (!targetEmail) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save OTP (associated with phone as primary key usually, or email?)
    // Our OTP schema uses 'phone', let's stick to using phone if user has one, effectively using phone as key for OTP.
    // Or if user found by email, use user.phone as key if available.
    // User schema guarantees phone is required for everyone except maybe legacy? 
    // User schema: phone: { type: String, required: true, unique: true }
    // So we can always index OTP by phone.

    await Otp.findOneAndUpdate(
      { phone: user.phone },
      { code, expiresAt, attempts: 0 },
      { upsert: true }
    );

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
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpRecord = await Otp.findOne({ phone: user.phone });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    if (otpRecord.code !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ phone: user.phone });

    res.json({ success: true, message: 'Password reset successful. Please login.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp, userData } = req.body;
  try {
    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found.' });
    }

    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ phone });
      return res.status(400).json({ message: 'Too many failed attempts. Request a new OTP.' });
    }

    if (otpRecord.code !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    // FIX: Use findOne instead of find to avoid array type mismatch
    let user = await User.findOne({ phone });

    if (!user && userData) {
      // Create user on successful registration OTP verification
      const patientId = `PID${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

      // Extract patient specific details from userData
      const { address, gender, dob, age, govId, ...rest } = userData;

      user = await User.create({
        ...rest,
        phone,
        role: 'PATIENT',
        address: address || {},
        patientDetails: {
          patientId,
          gender,
          dob,
          age,
          govId
        },
        avatar: `https://ui-avatars.com/api/?name=${userData.name}`
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cleanup OTP
    await Otp.deleteOne({ phone });

    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id.toString())
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification error' });
  }
};

export const login = async (req: Request, res: Response) => {
  // Legacy email login preserved for Admin/Doctor
  const { email, password, role } = req.body;
  try {
    const user: any = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      if (role && user.role !== role) {
        return res.status(401).json({ message: 'Unauthorized role' });
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
