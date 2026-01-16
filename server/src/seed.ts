
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Drug, DrugInteraction } from './models'; // Corrected path from ../models to ./models
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

        console.log('Clearing existing users, drugs, and interactions...');
        await User.deleteMany({});
        await Drug.deleteMany({});
        await DrugInteraction.deleteMany({});

        console.log('Seeding users...');

        const usersWithHashes = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return { ...user, password: hashedPassword };
        }));

        await User.insertMany(usersWithHashes);

        console.log('Seeding drugs and interactions...');

        const drugs = [
            {
                name: 'Aspirin',
                category: 'Analgesic',
                description: 'Pain reliever and anti-inflammatory used to reduce fever and relieve minor aches and pains.',
                dosageTiming: 'Take with food or milk to prevent stomach upset.',
                minDose: '300mg',
                maxDose: '4000mg/day',
                sideEffects: 'Heartburn, nausea, stomach pain'
            },
            {
                name: 'Warfarin',
                category: 'Anticoagulant',
                description: 'Blood thinner used to prevent and treat blood clots.',
                dosageTiming: 'Take at the same time every day, usually in the evening.',
                minDose: '2mg',
                maxDose: '10mg/day (highly variable)',
                sideEffects: 'Bleeding, bruising'
            },
            {
                name: 'Ibuprofen',
                category: 'NSAID',
                description: 'Nonsteroidal anti-inflammatory drug used for treating pain, fever, and inflammation.',
                dosageTiming: 'Take with food or milk to reduce stomach irritation.',
                minDose: '200mg',
                maxDose: '3200mg/day',
                sideEffects: 'Stomach pain, heartburn, dizziness'
            },
            {
                name: 'Paracetamol',
                category: 'Analgesic',
                description: 'Common pain reliever and fever reducer.',
                dosageTiming: 'Can be taken with or without food.',
                minDose: '500mg',
                maxDose: '4000mg/day',
                sideEffects: 'Nausea, liver damage (at high doses)'
            },
            {
                name: 'Amoxicillin',
                category: 'Antibiotic',
                description: 'Penicillin antibiotic used to treat various bacterial infections.',
                dosageTiming: 'Can be taken with or without food. Ensure to complete the full course.',
                minDose: '250mg',
                maxDose: '3000mg/day',
                sideEffects: 'Nausea, vomiting, developing trash'
            },
            {
                name: 'Alcohol',
                category: 'Substance',
                description: 'Alcoholic beverages.',
                dosageTiming: 'N/A',
                minDose: 'N/A',
                maxDose: 'N/A',
                sideEffects: 'Intoxication, liver damage'
            }
        ];

        await Drug.insertMany(drugs);

        const interactions = [
            {
                drugs: ['aspirin', 'warfarin'],
                severity: 'Severe',
                description: 'Increased risk of bleeding.',
                management: 'Avoid combination. Monitor INR closely.'
            },
            {
                drugs: ['ibuprofen', 'aspirin'],
                severity: 'Moderate',
                description: 'Ibuprofen may reduce the heart-protecting effects of aspirin.',
                management: 'Take aspirin at least 30 minutes before ibuprofen.'
            },
            {
                drugs: ['paracetamol', 'alcohol'],
                severity: 'Severe',
                description: 'Increased risk of liver damage.',
                management: 'Avoid alcohol while taking paracetamol.'
            },
            {
                drugs: ['warfarin', 'ibuprofen'],
                severity: 'Severe',
                description: 'Significantly increased risk of stomach bleeding.',
                management: 'Avoid combination.'
            }
        ];

        await DrugInteraction.insertMany(interactions);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedData();
