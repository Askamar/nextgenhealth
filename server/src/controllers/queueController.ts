import { Request, Response } from 'express';
import { prisma } from '../config/db';

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

        const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
        if (!doctor || doctor.role !== 'DOCTOR') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ===== TOKEN LIMIT CHECK =====
        // Calculate max tokens based on working hours (assume 8 hours) and avg consultation time
        const avgTime = doctor.doctorAvgConsultationTime || 15;
        const workingMinutes = 8 * 60; // 8 hours
        const maxDailyTokens = Math.floor(workingMinutes / avgTime);

        // Count today's tokens for this doctor
        const todayTokenCount = await prisma.token.count({
            where: {
                doctorId,
                createdAt: { gte: today }
            }
        });

        if (todayTokenCount >= maxDailyTokens) {
            return res.status(400).json({
                message: `Doctor's queue is full for today. Maximum ${maxDailyTokens} patients can be seen.`,
                maxTokens: maxDailyTokens,
                currentTokens: todayTokenCount
            });
        }

        // ===== CHECK IF PATIENT ALREADY HAS A TOKEN =====
        const existingToken = await prisma.token.findFirst({
            where: {
                patientId,
                doctorId,
                status: { in: ['PENDING', 'ACTIVE'] },
                createdAt: { gte: today }
            }
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
        const pendingTokens = await prisma.token.count({
            where: {
                doctorId,
                status: { in: ['PENDING', 'ACTIVE'] },
                createdAt: { gte: today }
            }
        });

        // Find last token number
        const lastToken = await prisma.token.findFirst({
            where: {
                doctorId,
                createdAt: { gte: today }
            },
            orderBy: {
                tokenNumber: 'desc'
            }
        });

        const newTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

        // Estimate time (Emergency gets priority - add to front)
        const estWaitMinutes = tokenType === 'EMERGENCY'
            ? Math.min(pendingTokens * avgTime * 0.3, 15) // Max 15 min wait for emergency
            : pendingTokens * avgTime;
        const estimatedTime = new Date(Date.now() + estWaitMinutes * 60000);

        const newToken = await prisma.token.create({
            data: {
                patientId,
                patientName: req.body.patientName || 'Unknown',
                doctorId,
                tokenNumber: newTokenNumber,
                status: 'PENDING',
                type: tokenType,
                emergencyReason: tokenType === 'EMERGENCY' ? emergencyReason : null,
                estimatedTime
            }
        });

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

        const activeToken = await prisma.token.findFirst({
            where: {
                doctorId,
                status: 'ACTIVE',
                createdAt: { gte: today }
            }
        });

        const pendingTokens = await prisma.token.findMany({
            where: {
                doctorId,
                status: 'PENDING',
                createdAt: { gte: today }
            },
            orderBy: [
                { type: 'asc' }, // 'EMERGENCY' < 'REGULAR' so emergency comes first
                { tokenNumber: 'asc' }
            ]
        });

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
        const token = await prisma.token.findUnique({ where: { id: tokenId } });
        if (!token) return res.status(404).json({ message: 'Token not found' });

        let startTime: Date | null = token.startTime;
        let endTime: Date | null = token.endTime;

        if (status === 'ACTIVE') {
            startTime = new Date();
        } else if (status === 'COMPLETED') {
            endTime = new Date();

            // Calculate actual duration
            if (token.startTime) {
                const durationMinutes = (endTime.getTime() - new Date(token.startTime).getTime()) / 60000;

                // Update Doctor's avgConsultationTime (Moving Average)
                const doctor = await prisma.user.findUnique({ where: { id: token.doctorId } });
                if (doctor) {
                    const currentAvg = doctor.doctorAvgConsultationTime || 15;
                    const patientsServed = doctor.doctorPatients || 0;

                    // Simple moving average formula
                    const reviewCount = Math.min(patientsServed, 50);
                    const newAvg = ((currentAvg * reviewCount) + durationMinutes) / (reviewCount + 1);

                    await prisma.user.update({
                        where: { id: token.doctorId },
                        data: {
                            doctorAvgConsultationTime: Math.round(newAvg),
                            doctorPatients: patientsServed + 1
                        }
                    });
                }
            }
        }

        const updatedToken = await prisma.token.update({
            where: { id: tokenId },
            data: {
                status,
                startTime,
                endTime
            }
        });

        res.json({ success: true, token: updatedToken });
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
        const dailyLoad = await prisma.token.count({
            where: {
                doctorId,
                createdAt: { gte: today }
            }
        });

        // Completed Patients
        const completedPatients = await prisma.token.count({
            where: {
                doctorId,
                status: 'COMPLETED',
                createdAt: { gte: today }
            }
        });

        // Average Consultation Time
        const doctor = await prisma.user.findUnique({
            where: { id: doctorId },
            select: {
                doctorAvgConsultationTime: true
            }
        });

        res.json({
            dailyLoad,
            completedPatients,
            avgConsultationTime: doctor?.doctorAvgConsultationTime || 15
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

        const tokens = await prisma.token.findMany({
            where: {
                patientId,
                createdAt: { gte: today }
            }
        });

        // Populate doctor details manually
        const populatedTokens = await Promise.all(tokens.map(async (token) => {
            const doctor = await prisma.user.findUnique({
                where: { id: token.doctorId },
                select: {
                    name: true,
                    doctorSpecialization: true
                }
            });
            return {
                ...token,
                doctorId: {
                    id: token.doctorId,
                    name: doctor?.name || 'Unknown Doctor',
                    doctorDetails: {
                        specialization: doctor?.doctorSpecialization || 'General'
                    }
                }
            };
        }));

        res.json(populatedTokens);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
