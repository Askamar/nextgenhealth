export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  patientDetails?: {
    dob: string;
    bloodGroup: string;
    gender: 'Male' | 'Female' | 'Other';
    allergies?: string;
    weight?: string;
    height?: string;
    lastVisit?: string;
  };
  doctorDetails?: {
    specialization: string;
    qualification: string;
    experience: number;
    availability: string[]; // e.g., ["Mon", "Wed", "Fri"]
    rating?: number;
    patients?: number;
  };
}

export interface Doctor extends User {
  doctorDetails: NonNullable<User['doctorDetails']>;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: AppointmentStatus;
  type?: 'In-Person' | 'Video Call';
  notes?: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  date: string;
  doctorName: string;
  type: 'Lab' | 'Radiology' | 'Prescription' | 'General';
  imageUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'result' | 'reminder' | 'system';
  read: boolean;
}

export interface Vaccine {
  id: string;
  name: string;
  type: 'Viral' | 'Bacterial' | 'Other';
  ageGroup: 'Child' | 'Adult' | 'Senior';
  date: string; // YYYY-MM-DD
  batchNumber: string;
  stock: number;
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  icon: string;
}