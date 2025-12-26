import { User, Role, Appointment, AppointmentStatus, MedicalReport, Notification, Vaccine } from '../types';

// --- MOCK DATABASE ---

export const USERS: User[] = [
  {
    id: 'admin1',
    name: 'Eleanor Pena',
    email: 'admin@medicore.com',
    role: Role.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'doc1',
    name: 'Dr. John Smith',
    email: 'john.smith@medicore.com',
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
    id: 'doc2',
    name: 'Dr. Emily White',
    email: 'emily.white@medicore.com',
    role: Role.DOCTOR,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    doctorDetails: {
      specialization: 'Pediatrics',
      qualification: 'MBBS, DCH',
      experience: 8,
      availability: ['Mon', 'Wed', 'Fri'],
      rating: 4.8,
      patients: 850
    }
  },
  {
    id: 'doc3',
    name: 'Dr. Michael Brown',
    email: 'm.brown@medicore.com',
    role: Role.DOCTOR,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    doctorDetails: {
      specialization: 'Neurology',
      qualification: 'MD, PhD',
      experience: 12,
      availability: ['Tue', 'Thu'],
      rating: 4.9,
      patients: 600
    }
  },
  {
    id: 'pat1',
    name: 'Maria Garcia',
    email: 'maria@gmail.com',
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
  },
  {
    id: 'appt2',
    patientId: 'pat1',
    patientName: 'Maria Garcia',
    patientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
    doctorId: 'doc2',
    doctorName: 'Dr. Emily White',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    department: 'Pediatrics',
    date: '2023-12-01',
    time: '02:00 PM',
    status: AppointmentStatus.PENDING,
    type: 'Video Call'
  },
  {
    id: 'appt3',
    patientId: 'pat2',
    patientName: 'Liam Johnson',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    doctorId: 'doc1',
    doctorName: 'Dr. John Smith',
    department: 'Cardiology',
    date: '2023-10-25',
    time: '09:00 AM',
    status: AppointmentStatus.COMPLETED,
    type: 'In-Person'
  },
  {
    id: 'appt4',
    patientId: 'pat3',
    patientName: 'Olivia Rhye',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    doctorId: 'doc1',
    doctorName: 'Dr. John Smith',
    department: 'Cardiology',
    date: '2023-10-25',
    time: '11:15 AM',
    status: AppointmentStatus.PENDING,
    type: 'In-Person'
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
  },
  {
    id: 'rep2',
    title: 'Cardiology Report',
    date: 'Sep 15, 2023',
    doctorName: 'Dr. Ben Carter',
    type: 'General',
    imageUrl: 'https://st.depositphotos.com/1907633/2369/i/450/depositphotos_23693897-stock-photo-electrocardiogram-ecg-heart-beat-test.jpg'
  },
  {
    id: 'rep3',
    title: 'MRI Scan - Brain',
    date: 'Aug 30, 2023',
    doctorName: 'Radiology Dept',
    type: 'Radiology',
    imageUrl: 'https://media.istockphoto.com/id/1155609395/photo/human-brain-scan.jpg?s=612x612&w=0&k=20&c=6k52yD5i7uK-k7t4i3yE1g_sM6y5x_I9Q_y_t_x_9_0='
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
  },
  {
    id: 'not2',
    title: 'Lab Results Ready',
    message: 'Your blood test results from Dr. Reed are ready.',
    time: '1 day ago',
    type: 'result',
    read: false
  },
  {
    id: 'not3',
    title: 'Appointment Reminder',
    message: 'Cardiology check-up tomorrow at 10:30 AM.',
    time: '2 days ago',
    type: 'reminder',
    read: true
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
  },
  {
    id: 'vac2',
    name: 'Flu Shot',
    type: 'Viral',
    ageGroup: 'Adult',
    date: '2023-10-15',
    batchNumber: 'V-2023-002',
    stock: 500
  },
  {
    id: 'vac3',
    name: 'Hepatitis B',
    type: 'Viral',
    ageGroup: 'Child',
    date: '2023-10-15',
    batchNumber: 'V-2023-003',
    stock: 200
  },
  {
    id: 'vac4',
    name: 'Pneumococcal',
    type: 'Bacterial',
    ageGroup: 'Senior',
    date: '2023-10-25',
    batchNumber: 'V-2023-004',
    stock: 75
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