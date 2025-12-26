
import { Request, Response } from 'express';
import { User, Otp } from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

export const requestOtp = async (req: Request, res: Response) => {
    const { phone, isRegistration } = req.body;
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

        // In production, use an SMS gateway like Twilio or Vonage here
        console.log(`[SMS Gateway] Sending OTP ${code} to ${phone}`);

        await Otp.findOneAndUpdate(
            { phone },
            { code, expiresAt, attempts: 0 },
            { upsert: true }
        );

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP' });
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
            user = await User.create({
                ...userData,
                phone,
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
