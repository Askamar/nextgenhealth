import bcrypt from 'bcryptjs';
import { prisma } from './config/db';

const users = [
    {
        name: 'Eleanor Pena',
        email: 'admin@medicore.com',
        phone: '555-0100',
        role: 'ADMIN',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        patientDetails: null,
        doctorDetails: null
    },
    {
        name: 'Dr. John Smith',
        email: 'john.smith@medicore.com',
        phone: '555-0101',
        role: 'DOCTOR',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
        patientDetails: null,
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
        name: 'Dr. Emily White',
        email: 'emily.white@medicore.com',
        phone: '555-0103',
        role: 'DOCTOR',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        patientDetails: null,
        doctorDetails: {
            specialization: 'Pediatrics',
            qualification: 'MBBS, DCH',
            experience: 8,
            availability: ['Mon', 'Wed', 'Fri'],
            rating: 4.8,
            patients: 850,
            avgConsultationTime: 15
        }
    },
    {
        name: 'Dr. Michael Brown',
        email: 'm.brown@medicore.com',
        phone: '555-0104',
        role: 'DOCTOR',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
        patientDetails: null,
        doctorDetails: {
            specialization: 'Neurology',
            qualification: 'MD, PhD',
            experience: 12,
            availability: ['Tue', 'Thu'],
            rating: 4.9,
            patients: 600,
            avgConsultationTime: 15
        }
    },
    {
        name: 'Maria Garcia',
        email: 'maria@gmail.com',
        phone: '555-0102',
        role: 'PATIENT',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
        doctorDetails: null,
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
        sideEffects: 'Nausea, vomiting, developing rash'
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

const seedData = async () => {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();

        console.log('Clearing all existing database records...');
        await prisma.appointment.deleteMany({});
        await prisma.prescription.deleteMany({});
        await prisma.medicalReport.deleteMany({});
        await prisma.token.deleteMany({});
        await prisma.vaccine.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.drug.deleteMany({});
        await prisma.drugInteraction.deleteMany({});

        console.log('Seeding users...');
        const usersWithHashes = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const { patientDetails, doctorDetails, ...rest } = user;
            
            // Generate patientId for patient
            let generatedPatientId: string | null = null;
            if (user.role === 'PATIENT') {
                generatedPatientId = `PID${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
            }

            return {
                ...rest,
                password: hashedPassword,
                patientId: generatedPatientId,
                patientDob: patientDetails?.dob || null,
                patientBloodGroup: patientDetails?.bloodGroup || null,
                patientGender: patientDetails?.gender || null,
                patientAllergies: patientDetails?.allergies || null,
                patientWeight: patientDetails?.weight || null,
                patientHeight: patientDetails?.height || null,
                patientLastVisit: patientDetails?.lastVisit ? new Date(patientDetails.lastVisit) : null,
                doctorSpecialization: doctorDetails?.specialization || null,
                doctorQualification: doctorDetails?.qualification || null,
                doctorExperience: doctorDetails?.experience ? Number(doctorDetails.experience) : null,
                doctorAvailability: doctorDetails?.availability ? JSON.stringify(doctorDetails.availability) : null,
                doctorRating: doctorDetails?.rating ? Number(doctorDetails.rating) : null,
                doctorPatients: doctorDetails?.patients ? Number(doctorDetails.patients) : null,
                doctorAvgConsultationTime: doctorDetails?.avgConsultationTime ? Number(doctorDetails.avgConsultationTime) : 15
            };
        }));

        for (const u of usersWithHashes) {
            await prisma.user.create({ data: u });
        }

        console.log('Seeding drugs...');
        for (const d of drugs) {
            await prisma.drug.create({ data: d });
        }

        console.log('Seeding drug interactions...');
        const interactionsWithJson = interactions.map(item => ({
            drugs: JSON.stringify(item.drugs),
            severity: item.severity,
            description: item.description,
            management: item.management || null
        }));

        for (const inter of interactionsWithJson) {
            await prisma.drugInteraction.create({ data: inter });
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error seeding data: ${error}`);
        process.exit(1);
    }
};

seedData();
