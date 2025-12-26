
import mongoose from 'mongoose';

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Sparse allows multiple nulls
  phone: { type: String, required: true, unique: true }, // Main identifier for Patients
  password: { type: String }, // Optional for patients (using OTP)
  role: { type: String, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
  avatar: String,
  // Patient Specific Fields
  patientDetails: {
    dob: String,
    bloodGroup: String,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    allergies: String,
    weight: String,
    height: String,
    lastVisit: Date
  },
  // Doctor Specific Fields
  doctorDetails: {
    specialization: String,
    qualification: String,
    experience: Number,
    availability: [String],
    rating: Number,
    patients: Number
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// --- OTP SCHEMA ---
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL Index
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

export const Otp = mongoose.model('Otp', otpSchema);

// --- APPOINTMENT SCHEMA ---
const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: String,
  patientAvatar: String,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: String,
  doctorAvatar: String,
  department: String,
  date: String,
  time: String,
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  type: { type: String, default: 'In-Person' },
  notes: String
}, { timestamps: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);

// --- VACCINE SCHEMA ---
const vaccineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Viral', 'Bacterial', 'Other'], required: true },
  ageGroup: { type: String, enum: ['Child', 'Adult', 'Senior'], required: true },
  date: { type: String, required: true },
  batchNumber: String,
  stock: { type: Number, default: 0 }
}, { timestamps: true });

export const Vaccine = mongoose.model('Vaccine', vaccineSchema);

// --- MEDICAL REPORT SCHEMA ---
const medicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  doctorName: String,
  type: { type: String, enum: ['Lab', 'Radiology', 'Prescription', 'General'], required: true },
  imageUrl: String
}, { timestamps: true });

export const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
