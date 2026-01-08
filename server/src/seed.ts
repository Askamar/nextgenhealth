
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models'; // Corrected path from ../models to ./models
import connectDB from './config/db';

dotenv.config();

const users = [
    {
        name: 'Eleanor Pena',
        email: 'admin@medicore.com',
        phone: '555-0100',
        role: 'ADMIN',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
    },
    {
        name: 'Dr. John Smith',
        email: 'john.smith@medicore.com',
        phone: '555-0101',
        role: 'DOCTOR',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
        doctorDetails: {
            specialization: 'Cardiology',
            qualification: 'MBBS, MD',
            experience: 15,
            availability: ['Mon', 'Tue', 'Wed', 'Thu'],
            rating: 4.9,
            patients: 1200,
            avgConsultationTime: 15
        }
    },
    {
        name: 'Maria Garcia',
        email: 'maria@gmail.com',
        phone: '555-0102',
        role: 'PATIENT',
        password: 'password123', // Optional for patients
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
        patientDetails: {
            dob: '1990-05-15',
            bloodGroup: 'O+',
            gender: 'Female',
            allergies: 'Penicillin',
            weight: '62 kg',
            height: '168 cm',
            lastVisit: new Date('2023-10-15')
        }
    }
];

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing users...');
        await User.deleteMany({});

        console.log('Seeding users...');

        const usersWithHashes = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return { ...user, password: hashedPassword };
        }));

        await User.insertMany(usersWithHashes);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedData();
