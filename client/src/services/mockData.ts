
import { User, Role, Appointment, AppointmentStatus, MedicalReport, Notification, Vaccine } from '../types';

export const USERS: User[] = [
  {
    id: 'admin1',
    name: 'Eleanor Pena',
    email: 'admin@medicore.com',
    phone: '555-0100',
    role: Role.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'doc1',
    name: 'Dr. John Smith',
    email: 'john.smith@medicore.com',
    phone: '555-0101',
    role: Role.DOCTOR,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    doctorDetails: {
      specialization: 'Cardiology',
      qualification: 'MBBS, MD',
      experience: 15,
      availability: ['Mon', 'Tue', 'Wed', 'Thu'],
      rating: 4.9,
      patients: 1200
    }
  },
  {
    id: 'pat1',
    name: 'Maria Garcia',
    email: 'maria@gmail.com',
    phone: '555-0102',
    role: Role.PATIENT,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
    patientDetails: {
      dob: '1990-05-15',
      bloodGroup: 'O+',
      gender: 'Female',
      allergies: 'Penicillin',
      weight: '62 kg',
      height: '168 cm',
      lastVisit: '2023-10-15'
    }
  }
];

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'appt1',
    patientId: 'pat1',
    patientName: 'Maria Garcia',
    patientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
    doctorId: 'doc1',
    doctorName: 'Dr. John Smith',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    department: 'Cardiology',
    date: '2023-10-25',
    time: '10:30 AM',
    status: AppointmentStatus.CONFIRMED,
    type: 'In-Person',
    notes: 'Regular checkup'
  }
];

export const REPORTS: MedicalReport[] = [
  {
    id: 'rep1',
    title: 'Blood Test Results',
    date: 'Oct 25, 2023',
    doctorName: 'Dr. Evelyn Reed',
    type: 'Lab',
    imageUrl: 'https://img.freepik.com/free-vector/health-check-report-clipboard_1308-109590.jpg'
  }
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'not1',
    title: 'New Bill Available',
    message: 'Your bill for the last visit is ready.',
    time: '2 hours ago',
    type: 'system',
    read: false
  }
];

export const VACCINES: Vaccine[] = [
  {
    id: 'vac1',
    name: 'MMR (Dose 1)',
    type: 'Viral',
    ageGroup: 'Child',
    date: '2023-10-05',
    batchNumber: 'V-2023-001',
    stock: 150
  }
];

export const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine'
];
