
import { Request, Response } from 'express';
import { Token, User } from '../models';

// Emergency Criteria - keywords that qualify for emergency
const EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'difficulty breathing', 'shortness of breath',
    'severe bleeding', 'unconscious', 'stroke', 'seizure', 'accident', 'trauma',
    'poisoning', 'allergic reaction', 'severe pain', 'fracture', 'broken bone',
    'high fever', 'labor', 'pregnancy emergency', 'diabetic emergency', 'cardiac'
];

// Function to validate emergency criteria
const validateEmergency = (reason: string): { valid: boolean; matchedCriteria: string[] } => {
    if (!reason || reason.trim().length < 10) {
        return { valid: false, matchedCriteria: [] };
    }

    const lowerReason = reason.toLowerCase();
    const matchedCriteria = EMERGENCY_KEYWORDS.filter(keyword =>
        lowerReason.includes(keyword)
    );

    return {
        valid: matchedCriteria.length > 0,
        matchedCriteria
    };
};

export const registerToken = async (req: Request, res: Response) => {
    try {
        const { patientId, doctorId, type, emergencyReason } = req.body;

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'DOCTOR') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ===== TOKEN LIMIT CHECK =====
        // Calculate max tokens based on working hours (assume 8 hours) and avg consultation time
        const avgTime = doctor.doctorDetails?.avgConsultationTime || 15;
        const workingMinutes = 8 * 60; // 8 hours
        const maxDailyTokens = Math.floor(workingMinutes / avgTime);

        // Count today's tokens for this doctor
        const todayTokenCount = await Token.countDocuments({
            doctorId,
            createdAt: { $gte: today }
        });

        if (todayTokenCount >= maxDailyTokens) {
            return res.status(400).json({
                message: `Doctor's queue is full for today. Maximum ${maxDailyTokens} patients can be seen.`,
                maxTokens: maxDailyTokens,
                currentTokens: todayTokenCount
            });
        }

        // ===== CHECK IF PATIENT ALREADY HAS A TOKEN =====
        const existingToken = await Token.findOne({
            patientId,
            doctorId,
            status: { $in: ['PENDING', 'ACTIVE'] },
            createdAt: { $gte: today }
        });

        if (existingToken) {
            return res.status(400).json({
                message: 'You already have an active token for this doctor today.',
                existingToken
            });
        }

        // ===== EMERGENCY VALIDATION =====
        let tokenType = 'REGULAR';

        if (type === 'EMERGENCY') {
            if (!emergencyReason) {
                return res.status(400).json({
                    message: 'Emergency cases require a reason. Please describe your emergency.',
                    requiresReason: true
                });
            }

            const validation = validateEmergency(emergencyReason);

            if (!validation.valid) {
                return res.status(400).json({
                    message: 'Your description does not meet emergency criteria. For true emergencies, please call 108 or visit the emergency ward directly.',
                    isEmergencyValid: false,
                    hint: 'Emergency cases include: chest pain, severe bleeding, difficulty breathing, accidents, unconscious patients, etc.'
                });
            }

            tokenType = 'EMERGENCY';
            console.log(`[EMERGENCY] Patient ${patientId} approved. Matched: ${validation.matchedCriteria.join(', ')}`);
        }

        // Find pending tokens for today to calculate position
        const pendingTokens = await Token.countDocuments({
            doctorId,
            status: { $in: ['PENDING', 'ACTIVE'] },
            createdAt: { $gte: today }
        });

        // Find last token number
        const lastToken = await Token.findOne({
            doctorId,
            createdAt: { $gte: today }
        }).sort({ tokenNumber: -1 });

        const newTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

        // Estimate time (Emergency gets priority - add to front)
        const estWaitMinutes = tokenType === 'EMERGENCY'
            ? Math.min(pendingTokens * avgTime * 0.3, 15) // Max 15 min wait for emergency
            : pendingTokens * avgTime;
        const estimatedTime = new Date(Date.now() + estWaitMinutes * 60000);

        const newToken = new Token({
            patientId,
            patientName: req.body.patientName || 'Unknown',
            doctorId,
            tokenNumber: newTokenNumber,
            status: 'PENDING',
            type: tokenType,
            emergencyReason: tokenType === 'EMERGENCY' ? emergencyReason : undefined,
            estimatedTime
        });

        await newToken.save();

        res.status(201).json({
            success: true,
            token: newToken,
            waitMinutes: Math.round(estWaitMinutes),
            queuePosition: pendingTokens + 1,
            remainingSlots: maxDailyTokens - todayTokenCount - 1,
            message: tokenType === 'EMERGENCY'
                ? 'Emergency token registered. You will be prioritized.'
                : 'Token registered successfully'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getQueueStatus = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeToken = await Token.findOne({
            doctorId,
            status: 'ACTIVE',
            createdAt: { $gte: today }
        });

        const pendingTokens = await Token.find({
            doctorId,
            status: 'PENDING',
            createdAt: { $gte: today }
        }).sort({ type: 1, tokenNumber: 1 }); // Sort by Type (EMERGENCY?? alphabetical?? No - Emergency logic needed)
        // Actually alphabetical 'EMERGENCY' vs 'REGULAR'. 'E' < 'R', so Emergency comes first with simple sort?
        // Let's rely on Creation order for now (tokenNumber). If urgent, we might need manual override.

        // Better sort: Emergency first, then TokenNumber
        // But 'E' < 'R' works.

        res.json({
            activeToken,
            queue: pendingTokens,
            totalWaiting: pendingTokens.length
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateTokenStatus = async (req: Request, res: Response) => {
    try {
        const { tokenId, status } = req.body;
        const token = await Token.findById(tokenId);
        if (!token) return res.status(404).json({ message: 'Token not found' });

        if (status === 'ACTIVE') {
            token.startTime = new Date();
        } else if (status === 'COMPLETED') {
            const endTime = new Date();
            token.endTime = endTime;

            // Calculate actual duration
            if (token.startTime) {
                const durationMinutes = (endTime.getTime() - new Date(token.startTime).getTime()) / 60000;

                // Update Doctor's avgConsultationTime (Moving Average)
                const doctor = await User.findById(token.doctorId);
                if (doctor && doctor.doctorDetails) {
                    const currentAvg = doctor.doctorDetails.avgConsultationTime || 15;
                    const patientsServed = doctor.doctorDetails.patients || 0;

                    // Simple moving average formula: NewAvg = ((OldAvg * N) + NewVal) / (N + 1)
                    // We cap N at 50 to keep it responsive to recent trends
                    const reviewCount = Math.min(patientsServed, 50);
                    const newAvg = ((currentAvg * reviewCount) + durationMinutes) / (reviewCount + 1);

                    doctor.doctorDetails.avgConsultationTime = Math.round(newAvg);
                    doctor.doctorDetails.patients = patientsServed + 1;
                    await doctor.save();
                }
            }
        }

        token.status = status;
        await token.save();

        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getQueueAnalytics = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Daily Load (Total tokens today)
        const dailyLoad = await Token.countDocuments({
            doctorId,
            createdAt: { $gte: today }
        });

        // Completed Patients
        const completedPatients = await Token.countDocuments({
            doctorId,
            status: 'COMPLETED',
            createdAt: { $gte: today }
        });

        // Average Consultation Time (fetched from user profile which is updated live)
        const doctor = await User.findById(doctorId).select('doctorDetails.avgConsultationTime');

        res.json({
            dailyLoad,
            completedPatients,
            avgConsultationTime: doctor?.doctorDetails?.avgConsultationTime || 15
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPatientToken = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tokens = await Token.find({
            patientId,
            createdAt: { $gte: today }
        }).populate('doctorId', 'name doctorDetails.specialization');

        res.json(tokens);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
