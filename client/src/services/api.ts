
import { User, Role, Appointment, AppointmentStatus, MedicalReport, Notification, Vaccine } from '../types';
import { USERS, APPOINTMENTS, DEPARTMENTS, REPORTS, NOTIFICATIONS, VACCINES } from './mockData';

export { DEPARTMENTS };

const USE_MOCK_DATA = true;
const API_URL = 'http://localhost:5000/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated OTP storage for Mock API
const MOCK_OTPS: Record<string, string> = {};

const MockAPI = {
    requestOtp: async (phone: string, isRegistration: boolean, email?: string): Promise<{ success: boolean; message: string }> => {
        await delay(1000);

        if (isRegistration && USERS.some(u => u.phone === phone)) {
            throw new Error('This phone number is already registered.');
        }

        if (!isRegistration && !USERS.some(u => u.phone === phone)) {
            throw new Error('Phone number not found. Please register.');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        MOCK_OTPS[phone] = otp;
        console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);

        return { success: true, message: 'OTP sent successfully' };
    },
    forgotPassword: async (identifier: string) => {
        await delay(500);
        return { success: true, message: 'Mock reset code sent' };
    },
    resetPassword: async (identifier: string, otp: string, newPassword: string) => {
        await delay(500);
        return { success: true, message: 'Mock password reset successful' };
    },
    verifyOtp: async (phone: string, otp: string, userData?: Partial<User>): Promise<User> => {
        await delay(1000);
        if (MOCK_OTPS[phone] !== otp) {
            throw new Error('Invalid or expired OTP');
        }

        let user = USERS.find(u => u.phone === phone);

        if (!user && userData) {
            // Register flow
            user = {
                id: `pat${Math.random().toString(36).substr(2, 9)}`,
                name: userData.name || 'New Patient',
                phone: phone,
                role: Role.PATIENT,
                avatar: `https://ui-avatars.com/api/?name=${userData.name}`,
                patientDetails: {
                    dob: userData.patientDetails?.dob || '',
                    bloodGroup: '',
                    gender: userData.patientDetails?.gender || 'Other'
                }
            };
            USERS.push(user);
        }

        if (!user) throw new Error('User not found');
        delete MOCK_OTPS[phone];
        return user;
    },
    login: async (email: string, role: Role): Promise<User> => {
        await delay(800);
        const user = USERS.find(u => u.email === email && u.role === role);
        if (!user) throw new Error('Invalid credentials');
        return user;
    },
    loginWithPassword: async (identifier: string, password: string): Promise<User> => {
        await delay(1000);
        // Allow mock login with any password >= 3 chars for demo, or specific ones.
        // Identify if identifier is phone or email
        const user = USERS.find(u => u.email === identifier || u.phone === identifier);
        if (!user) throw new Error('User not found');

        // In a real app, verify password hash here.
        // For this mock/demo, we'll assume any non-empty password is valid if user exists,
        // unless we want to simulate failure.
        if (password.length < 3) throw new Error('Invalid password');

        return user;
    },
    register: async (data: Partial<User>): Promise<User> => {
        await delay(1000);
        const user: User = {
            id: `pat${Math.random().toString(36).substr(2, 9)}`,
            name: data.name || 'New Patient',
            phone: data.phone || '000-0000',
            role: Role.PATIENT,
            avatar: `https://ui-avatars.com/api/?name=${data.name}`,
            ...data
        };
        USERS.push(user);
        return user;
    },
    getDoctors: async (): Promise<User[]> => { await delay(500); return USERS.filter(u => u.role === Role.DOCTOR); },
    createDoctor: async (data: any): Promise<User> => {
        await delay(800);
        const newDoc = { id: `doc${Math.random()}`, phone: '000-0000', ...data, role: Role.DOCTOR };
        USERS.push(newDoc);
        return newDoc;
    },
    deleteDoctor: async (id: string) => {
        await delay(500);
        const idx = USERS.findIndex(u => u.id === id);
        if (idx > -1) USERS.splice(idx, 1);
    },
    getPatients: async (): Promise<User[]> => { await delay(500); return USERS.filter(u => u.role === Role.PATIENT); },
    createPatient: async (data: any): Promise<User> => {
        await delay(800);
        const newPat = { id: `pat${Math.random()}`, phone: '000-0000', role: Role.PATIENT, avatar: `https://ui-avatars.com/api/?name=${data.name}`, ...data };
        USERS.push(newPat);
        return newPat;
    },
    deletePatient: async (id: string) => {
        await delay(500);
        const idx = USERS.findIndex(u => u.id === id);
        if (idx > -1) USERS.splice(idx, 1);
    },
    getAppointments: async (userId: string, role: Role): Promise<Appointment[]> => {
        await delay(600);
        if (role === Role.ADMIN) return APPOINTMENTS;
        if (role === Role.DOCTOR) return APPOINTMENTS.filter(a => a.doctorId === userId);
        return APPOINTMENTS.filter(a => a.patientId === userId);
    },
    createAppointment: async (appt: any): Promise<Appointment> => {
        await delay(800);
        const newAppt = { id: `appt${Math.random()}`, status: AppointmentStatus.PENDING, ...appt };
        APPOINTMENTS.push(newAppt);
        return newAppt;
    },
    updateAppointmentStatus: async (id: string, status: AppointmentStatus) => {
        await delay(500);
        const appt = APPOINTMENTS.find(a => a.id === id);
        if (appt) appt.status = status;
    },
    getVaccines: async (): Promise<Vaccine[]> => { await delay(500); return VACCINES; },
    addVaccine: async (v: any): Promise<Vaccine> => {
        const newV = { ...v, id: `vac${Math.random()}` };
        VACCINES.push(newV);
        return newV;
    },
    deleteVaccine: async (id: string) => {
        const idx = VACCINES.findIndex(v => v.id === id);
        if (idx > -1) VACCINES.splice(idx, 1);
    },
    getMedicalReports: async (uid: string) => REPORTS,
    getNotifications: async (uid: string) => NOTIFICATIONS,
    updatePatient: async (id: string, data: Partial<User>): Promise<User> => {
        await delay(600);
        const index = USERS.findIndex(u => u.id === id);
        if (index === -1) throw new Error("User not found");
        USERS[index] = { ...USERS[index], ...data };
        return USERS[index];
    },
    getStats: async () => ({
        doctors: USERS.filter(u => u.role === Role.DOCTOR).length,
        patients: USERS.filter(u => u.role === Role.PATIENT).length,
        appointments: APPOINTMENTS.length
    })
};
// Real API Implementation
const RealAPI = {
    requestOtp: async (phone: string, isRegistration: boolean, email?: string) => {
        const res = await fetch(`${API_URL}/auth/otp/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, email, isRegistration })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error requesting OTP');
        return data;
    },
    verifyOtp: async (phone: string, otp: string, userData?: Partial<User>) => {
        const res = await fetch(`${API_URL}/auth/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp, userData })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error verifying OTP');
        return data;
    },
    login: async (email: string, role: Role) => {
        // Only used for context simulation in some parts, but real login uses verifyOtp or password
        // Mapping this to password login if needed or just using it as a stub?
        // The UI calls login() from AuthContext which updates local state. 
        // AuthContext.login calls api.login usually? No, AuthContext calls api.login

        // Actually the 'login' function in api.ts was simulating 'email/role' only login. 
        // Real authController.login uses email/password. 
        // We'll map this to the real login endpoint if password is provided, but the signature here is just email/role.
        // This signature `login(email, role)` is legacy from the Mock. 
        // We should rely on `loginWithPassword` for real auth.
        return MockAPI.login(email, role);
    },
    loginWithPassword: async (identifier: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    },
    register: async (data: Partial<User> & { password?: string }) => {
        // Restructure data to match backend expectation: { phone, userData, password }
        const { phone, password, ...userData } = data;

        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password, userData })
        });
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.message || 'Registration failed');
        return responseData;
    },
    forgotPassword: async (identifier: string) => {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to send reset code');
        return data;
    },
    resetPassword: async (identifier: string, otp: string, newPassword: string) => {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, otp, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to reset password');
        return data;
    },
    getDoctors: async () => {
        const res = await fetch(`${API_URL}/users?role=DOCTOR`);
        const data = await res.json();
        return data.map((u: any) => ({ ...u, id: u._id || u.id }));
    },
    updatePatient: async (id: string, data: Partial<User>) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update patient');
        return res.json();
    },
    // ... we can implement others as needed, falling back to Mock for now
    getAppointments: async (userId: string, role: Role) => {
        const res = await fetch(`${API_URL}/appointments?userId=${userId}&role=${role}`);
        const data = await res.json();
        return data.map((a: any) => ({ ...a, id: a._id || a.id }));
    },
    createAppointment: async (appt: any) => {
        const res = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appt)
        });
        return res.json();
    },
    getMedicalReports: async (userId: string) => {
        const res = await fetch(`${API_URL}/reports?userId=${userId}`);
        return res.json();
    },
    getVaccines: async () => {
        const res = await fetch(`${API_URL}/vaccines`);
        return res.json();
    },
};

// Toggle this to switch between Mock and Real
const USE_REAL_API = true;

const SelectedAPI = USE_REAL_API ? { ...MockAPI, ...RealAPI } : MockAPI;

export const requestOtpAPI = SelectedAPI.requestOtp;
export const verifyOtpAPI = SelectedAPI.verifyOtp;
export const loginAPI = SelectedAPI.login;
export const loginWithPasswordAPI = SelectedAPI.loginWithPassword;
export const forgotPasswordAPI = SelectedAPI.forgotPassword;
export const resetPasswordAPI = SelectedAPI.resetPassword;
export const registerAPI = SelectedAPI.register;

export const getDoctorsAPI = SelectedAPI.getDoctors;
export const createDoctorAPI = MockAPI.createDoctor; // Keep mock for admin functions not fully implemented
export const deleteDoctorAPI = MockAPI.deleteDoctor;

export const getPatientsAPI = MockAPI.getPatients;
export const createPatientAPI = MockAPI.createPatient;
export const updatePatientAPI = SelectedAPI.updatePatient;
export const deletePatientAPI = MockAPI.deletePatient;

export const getAppointmentsAPI = SelectedAPI.getAppointments;
export const createAppointmentAPI = SelectedAPI.createAppointment;
export const updateAppointmentStatusAPI = MockAPI.updateAppointmentStatus;

export const getVaccinesAPI = SelectedAPI.getVaccines;
export const addVaccineAPI = MockAPI.addVaccine;
export const deleteVaccineAPI = MockAPI.deleteVaccine;

export const getMedicalReportsAPI = SelectedAPI.getMedicalReports;
export const getNotificationsAPI = MockAPI.getNotifications;
export const getStatsAPI = MockAPI.getStats;
