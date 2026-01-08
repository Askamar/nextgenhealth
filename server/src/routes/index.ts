
import express from 'express';
import * as authController from '../controllers/authController';
import { User, Appointment, Vaccine, MedicalReport } from '../models';

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
    const role = req.query.role;
    const filter = role ? { role } : {};
    const users = await User.find(filter);
    res.json(users);
});

router.post('/users', async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
});

router.put('/users/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
});

router.delete('/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
});

// --- APPOINTMENTS ---
router.get('/appointments', async (req, res) => {
    const { userId, role } = req.query;
    let query = {};
    if (role === 'PATIENT') query = { patientId: userId };
    else if (role === 'DOCTOR') query = { doctorId: userId };

    const appointments = await Appointment.find(query);
    res.json(appointments);
});

router.post('/appointments', async (req, res) => {
    const appt = await Appointment.create(req.body);
    res.json(appt);
});

router.put('/appointments/:id/status', async (req, res) => {
    const appt = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
    );
    res.json(appt);
});

// --- VACCINES ---
router.get('/vaccines', async (req, res) => {
    const vaccines = await Vaccine.find({});
    res.json(vaccines);
});

router.post('/vaccines', async (req, res) => {
    const vac = await Vaccine.create(req.body);
    res.json(vac);
});

router.delete('/vaccines/:id', async (req, res) => {
    await Vaccine.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- REPORTS ---
router.get('/reports', async (req, res) => {
    const reports = await MedicalReport.find({ userId: req.query.userId });
    res.json(reports);
});

// --- QUEUE MANAGEMENT ---
import * as queueController from '../controllers/queueController';

router.post('/queue/register', queueController.registerToken);
router.get('/queue/doctor/:doctorId', queueController.getQueueStatus);
router.get('/queue/analytics/:doctorId', queueController.getQueueAnalytics); // New Analytics Route
router.put('/queue/token/status', queueController.updateTokenStatus);
router.get('/queue/patient/:patientId', queueController.getPatientToken);


export default router;
