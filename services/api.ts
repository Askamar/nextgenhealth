import { User, Role, Appointment, AppointmentStatus, MedicalReport, Notification, Vaccine } from '../types';
import { USERS, APPOINTMENTS, DEPARTMENTS, REPORTS, NOTIFICATIONS, VACCINES } from './mockData';

export { DEPARTMENTS };

// TOGGLE THIS TO SWITCH BETWEEN MOCK AND REAL BACKEND
const USE_MOCK_DATA = true;
const API_URL = 'http://localhost:5000/api';

// --- HELPER ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchAPI = async (endpoint: string, options: any = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
    };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

// ==========================================
//               MOCK IMPLEMENTATION
// ==========================================

const MockAPI = {
    login: async (email: string, role: Role): Promise<User> => {
        await delay(800);
        const user = USERS.find(u => u.email === email && u.role === role);
        if (!user) throw new Error('Invalid credentials');
        return user;
    },
    register: async (data: Partial<User>): Promise<User> => {
        await delay(800);
        const newUser: User = {
            id: `pat${Math.random().toString(36).substr(2, 9)}`,
            name: data.name || 'New User',
            email: data.email || '',
            role: Role.PATIENT,
            avatar: `https://ui-avatars.com/api/?name=${data.name}`,
            patientDetails: { dob: '', bloodGroup: '', gender: 'Male', ...data.patientDetails }
        };
        USERS.push(newUser);
        return newUser;
    },
    getDoctors: async (): Promise<User[]> => {
        await delay(500);
        return USERS.filter(u => u.role === Role.DOCTOR);
    },
    createDoctor: async (data: any): Promise<User> => {
        await delay(800);
        const newDoc = { id: `doc${Math.random()}`, ...data, role: Role.DOCTOR };
        USERS.push(newDoc);
        return newDoc;
    },
    deleteDoctor: async (id: string) => {
        await delay(500);
        const idx = USERS.findIndex(u => u.id === id);
        if(idx > -1) USERS.splice(idx, 1);
    },
    getPatients: async (): Promise<User[]> => {
        await delay(500);
        return USERS.filter(u => u.role === Role.PATIENT);
    },
    createPatient: async (data: any): Promise<User> => {
        await delay(800);
        const newPat = { id: `pat${Math.random()}`, role: Role.PATIENT, avatar: `https://ui-avatars.com/api/?name=${data.name}`, ...data };
        USERS.push(newPat);
        return newPat;
    },
    updatePatient: async (id: string, data: Partial<User>): Promise<User> => {
        await delay(600);
        const index = USERS.findIndex(u => u.id === id);
        if (index === -1) throw new Error("User not found");
        USERS[index] = { ...USERS[index], ...data };
        return USERS[index];
    },
    deletePatient: async (id: string) => {
        await delay(500);
        const idx = USERS.findIndex(u => u.id === id);
        if(idx > -1) USERS.splice(idx, 1);
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
        if(idx > -1) VACCINES.splice(idx, 1);
    },
    getMedicalReports: async (uid: string) => REPORTS,
    getNotifications: async (uid: string) => NOTIFICATIONS,
    getStats: async () => ({
        doctors: USERS.filter(u => u.role === Role.DOCTOR).length,
        patients: USERS.filter(u => u.role === Role.PATIENT).length,
        appointments: APPOINTMENTS.length
    })
};

// ==========================================
//               REAL API CLIENT
// ==========================================

const RealAPI = {
    login: (email: string, role: Role) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: '123', role }) }),
    register: (data: any) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    
    getDoctors: () => fetchAPI('/users?role=DOCTOR'),
    createDoctor: (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify({ ...data, role: 'DOCTOR' }) }),
    deleteDoctor: (id: string) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),

    getPatients: () => fetchAPI('/users?role=PATIENT'),
    createPatient: (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify({ ...data, role: 'PATIENT' }) }),
    updatePatient: (id: string, data: any) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePatient: (id: string) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),

    getAppointments: (userId: string, role: Role) => fetchAPI(`/appointments?userId=${userId}&role=${role}`),
    createAppointment: (data: any) => fetchAPI('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    updateAppointmentStatus: (id: string, status: string) => fetchAPI(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

    getVaccines: () => fetchAPI('/vaccines'),
    addVaccine: (data: any) => fetchAPI('/vaccines', { method: 'POST', body: JSON.stringify(data) }),
    deleteVaccine: (id: string) => fetchAPI(`/vaccines/${id}`, { method: 'DELETE' }),

    getMedicalReports: (userId: string) => fetchAPI(`/reports?userId=${userId}`),
    getNotifications: async (userId: string) => NOTIFICATIONS, // Mocked for now
    getStats: async () => ({ doctors: 0, patients: 0, appointments: 0 }) // Should implement /stats endpoint
};

// Export based on flag
export const loginAPI = USE_MOCK_DATA ? MockAPI.login : RealAPI.login;
export const registerAPI = USE_MOCK_DATA ? MockAPI.register : RealAPI.register;

export const getDoctorsAPI = USE_MOCK_DATA ? MockAPI.getDoctors : RealAPI.getDoctors;
export const createDoctorAPI = USE_MOCK_DATA ? MockAPI.createDoctor : RealAPI.createDoctor;
export const deleteDoctorAPI = USE_MOCK_DATA ? MockAPI.deleteDoctor : RealAPI.deleteDoctor;

export const getPatientsAPI = USE_MOCK_DATA ? MockAPI.getPatients : RealAPI.getPatients;
export const createPatientAPI = USE_MOCK_DATA ? MockAPI.createPatient : RealAPI.createPatient;
export const updatePatientAPI = USE_MOCK_DATA ? MockAPI.updatePatient : RealAPI.updatePatient;
export const deletePatientAPI = USE_MOCK_DATA ? MockAPI.deletePatient : RealAPI.deletePatient;

export const getAppointmentsAPI = USE_MOCK_DATA ? MockAPI.getAppointments : RealAPI.getAppointments;
export const createAppointmentAPI = USE_MOCK_DATA ? MockAPI.createAppointment : RealAPI.createAppointment;
export const updateAppointmentStatusAPI = USE_MOCK_DATA ? MockAPI.updateAppointmentStatus : RealAPI.updateAppointmentStatus;

export const getVaccinesAPI = USE_MOCK_DATA ? MockAPI.getVaccines : RealAPI.getVaccines;
export const addVaccineAPI = USE_MOCK_DATA ? MockAPI.addVaccine : RealAPI.addVaccine;
export const deleteVaccineAPI = USE_MOCK_DATA ? MockAPI.deleteVaccine : RealAPI.deleteVaccine;

export const getMedicalReportsAPI = USE_MOCK_DATA ? MockAPI.getMedicalReports : RealAPI.getMedicalReports;
export const getNotificationsAPI = USE_MOCK_DATA ? MockAPI.getNotifications : RealAPI.getNotifications;
export const getStatsAPI = USE_MOCK_DATA ? MockAPI.getStats : RealAPI.getStats;