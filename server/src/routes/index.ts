import express from 'express';
import * as authController from '../controllers/authController';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

const router = express.Router();

// --- AUTH ---
router.post('/auth/login', authController.login);
router.post('/auth/otp/request', authController.requestOtp);
router.post('/auth/otp/verify', authController.verifyOtp);
router.post('/auth/register', authController.register);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// --- USERS ---
router.get('/users', async (req, res) => {
    try {
        const role = req.query.role as string;
        const filter = role ? { role } : {};
        const users = await prisma.user.findMany({ where: filter });
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { address, patientDetails, doctorDetails, ...rest } = req.body;
        
        let hashedPassword = rest.password || null;
        if (rest.password) {
            hashedPassword = await bcrypt.hash(rest.password, 10);
        }

        const phone = rest.phone || `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;

        const user = await prisma.user.create({
            data: {
                ...rest,
                password: hashedPassword,
                phone,
                gender: rest.gender || null,
                addressStreet: address?.street || null,
                addressCity: address?.city || null,
                addressState: address?.state || null,
                addressPincode: address?.pincode || null,
                patientId: patientDetails?.patientId || null,
                patientDob: patientDetails?.dob || null,
                patientAge: patientDetails?.age ? Number(patientDetails.age) : null,
                patientBloodGroup: patientDetails?.bloodGroup || null,
                patientGender: patientDetails?.gender || null,
                patientAllergies: patientDetails?.allergies || null,
                patientWeight: patientDetails?.weight || null,
                patientHeight: patientDetails?.height || null,
                patientLastVisit: patientDetails?.lastVisit ? new Date(patientDetails.lastVisit) : null,
                patientGovIdType: patientDetails?.govId?.type || null,
                patientGovIdNumber: patientDetails?.govId?.number || null,
                doctorSpecialization: doctorDetails?.specialization || null,
                doctorQualification: doctorDetails?.qualification || null,
                doctorExperience: doctorDetails?.experience ? Number(doctorDetails.experience) : null,
                doctorAvailability: doctorDetails?.availability ? JSON.stringify(doctorDetails.availability) : null,
                doctorRating: doctorDetails?.rating ? Number(doctorDetails.rating) : null,
                doctorPatients: doctorDetails?.patients ? Number(doctorDetails.patients) : null,
                doctorAvgConsultationTime: doctorDetails?.avgConsultationTime ? Number(doctorDetails.avgConsultationTime) : 15
            }
        });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });
        const { address, patientDetails, doctorDetails, ...rest } = req.body;
        const data: any = { ...rest };

        if (existingUser?.role === 'DOCTOR') {
            if (!existingUser.doctorEditPermission) {
                return res.status(403).json({ message: 'Profile editing is locked. Please request permission from the Admin.' });
            }
            // Enforce read-only fields for doctor: ID, patients treated, ratings, email/gmail
            delete data.email;
            delete data.doctorPatients;
            delete data.doctorRating;
            if (doctorDetails) {
                delete doctorDetails.patients;
                delete doctorDetails.rating;
            }

            // Auto-relock the profile on save
            data.doctorEditPermission = false;
            data.doctorEditRequest = false;
        }
        
        if (rest.password) {
            data.password = await bcrypt.hash(rest.password, 10);
        } else {
            delete data.password;
        }
        
        if (address) {
            if (address.street !== undefined) data.addressStreet = address.street;
            if (address.city !== undefined) data.addressCity = address.city;
            if (address.state !== undefined) data.addressState = address.state;
            if (address.pincode !== undefined) data.addressPincode = address.pincode;
        }
        if (patientDetails) {
            if (patientDetails.patientId !== undefined) data.patientId = patientDetails.patientId;
            if (patientDetails.dob !== undefined) data.patientDob = patientDetails.dob;
            if (patientDetails.age !== undefined) data.patientAge = Number(patientDetails.age);
            if (patientDetails.bloodGroup !== undefined) data.patientBloodGroup = patientDetails.bloodGroup;
            if (patientDetails.gender !== undefined) data.patientGender = patientDetails.gender;
            if (patientDetails.allergies !== undefined) data.patientAllergies = patientDetails.allergies;
            if (patientDetails.weight !== undefined) data.patientWeight = patientDetails.weight;
            if (patientDetails.height !== undefined) data.patientHeight = patientDetails.height;
            if (patientDetails.lastVisit !== undefined) data.patientLastVisit = patientDetails.lastVisit ? new Date(patientDetails.lastVisit) : null;
            if (patientDetails.govId) {
                if (patientDetails.govId.type !== undefined) data.patientGovIdType = patientDetails.govId.type;
                if (patientDetails.govId.number !== undefined) data.patientGovIdNumber = patientDetails.govId.number;
            }
        }
        if (doctorDetails) {
            if (doctorDetails.specialization !== undefined) data.doctorSpecialization = doctorDetails.specialization;
            if (doctorDetails.qualification !== undefined) data.doctorQualification = doctorDetails.qualification;
            if (doctorDetails.experience !== undefined) data.doctorExperience = Number(doctorDetails.experience);
            if (doctorDetails.availability !== undefined) data.doctorAvailability = JSON.stringify(doctorDetails.availability);
            if (doctorDetails.rating !== undefined) data.doctorRating = Number(doctorDetails.rating);
            if (doctorDetails.patients !== undefined) data.doctorPatients = Number(doctorDetails.patients);
            if (doctorDetails.avgConsultationTime !== undefined) data.doctorAvgConsultationTime = Number(doctorDetails.avgConsultationTime);
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data
        });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:id/request-edit', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                doctorEditRequest: true,
                doctorEditPermission: false
            }
        });
        res.json({ success: true, user });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:id/grant-edit', async (req, res) => {
    try {
        const { allowed } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                doctorEditPermission: allowed,
                doctorEditRequest: false
            }
        });
        res.json({ success: true, user });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User deleted' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// --- APPOINTMENTS ---
router.get('/appointments', async (req, res) => {
    try {
        const { userId, role } = req.query;
        let query: any = {};
        if (role === 'PATIENT') query = { patientId: userId as string };
        else if (role === 'DOCTOR') query = { doctorId: userId as string };

        const appointments = await prisma.appointment.findMany({ where: query });
        res.json(appointments);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/appointments', async (req, res) => {
    try {
        const appt = await prisma.appointment.create({ data: req.body });
        res.json(appt);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/appointments/:id/status', async (req, res) => {
    try {
        const appt = await prisma.appointment.update({
            where: { id: req.params.id },
            data: { status: req.body.status }
        });
        res.json(appt);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// --- VACCINES ---
router.get('/vaccines', async (req, res) => {
    try {
        const vaccines = await prisma.vaccine.findMany({});
        res.json(vaccines);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/vaccines', async (req, res) => {
    try {
        const vac = await prisma.vaccine.create({ data: req.body });
        res.json(vac);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/vaccines/:id', async (req, res) => {
    try {
        await prisma.vaccine.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// --- REPORTS ---
router.get('/reports', async (req, res) => {
    try {
        const reports = await prisma.medicalReport.findMany({
            where: { userId: req.query.userId as string }
        });
        res.json(reports);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// --- QUEUE MANAGEMENT ---
import * as queueController from '../controllers/queueController';

router.post('/queue/register', queueController.registerToken);
router.get('/queue/doctor/:doctorId', queueController.getQueueStatus);
router.get('/queue/analytics/:doctorId', queueController.getQueueAnalytics);
router.put('/queue/token/status', queueController.updateTokenStatus);
router.get('/queue/patient/:patientId', queueController.getPatientToken);

// --- DRUGS ---
import drugRoutes from './drugRoutes';
router.use('/drugs', drugRoutes);

// --- DSA POWERED FEATURES ---
import dsaRoutes from './dsaRoutes';
router.use('/dsa', dsaRoutes);

// --- OOP & ANALYTICS ENHANCEMENTS ---
import * as prescriptionController from '../controllers/prescriptionController';
import * as analyticsController from '../controllers/analyticsController';

router.post('/prescriptions', prescriptionController.createPrescription);
router.get('/prescriptions/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.get('/prescriptions/doctor/:doctorId', prescriptionController.getDoctorPrescriptions);
router.put('/prescriptions/:id/acknowledge', prescriptionController.acknowledgePrescription);
router.get('/health-metrics', analyticsController.getHealthMetrics);
router.get('/symptom-analyze', analyticsController.analyzeSymptoms);

export default router;
