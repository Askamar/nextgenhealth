
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
  email?: string;
  phone: string; // Primary identifier for Patients
  role: Role;
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  patientDetails?: {
    patientId?: string;
    dob: string;
    age?: number;
    bloodGroup?: string;
    gender: 'Male' | 'Female' | 'Other';
    allergies?: string;
    weight?: string;
    height?: string;
    lastVisit?: string;
    govId?: {
      type: string;
      number: string;
    }
  };
  doctorDetails?: {
    specialization: string;
    qualification: string;
    experience: number;
    availability: string[];
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
  date: string;
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
  date: string;
  batchNumber: string;
  stock: number;
}



export interface Token {
  _id: string; // Mongoose ID
  patientId: string;
  patientName: string;
  doctorId: string; // or Doctor object if populated
  tokenNumber: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  type: 'REGULAR' | 'EMERGENCY';
  estimatedTime?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}
