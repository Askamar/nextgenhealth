/**
 * SymptomScanner Service - OOP Style
 * Maps textual symptoms to medical departments using array filters and string processing.
 */

import { prisma } from '../../config/db';

export interface ISymptomScanner {
    scan(query: string): Promise<SymptomMatchResult>;
}

export interface SymptomMatchResult {
    matchedDepartment: string;
    scorePercentage: number;
    recommendedDoctors: any[];
}

interface SpecKeywords {
    department: string;
    keywords: string[];
}

export class SymptomScanner implements ISymptomScanner {
    // Array of department keywords for mapping
    private specializations: SpecKeywords[] = [
        {
            department: 'Cardiology',
            keywords: ['heart', 'chest', 'pulse', 'bp', 'pressure', 'cardiac', 'palpitation', 'breathless', 'stroke']
        },
        {
            department: 'Pediatrics',
            keywords: ['baby', 'child', 'infant', 'kid', 'pediatric', 'teething', 'growth', 'vaccination', 'crying']
        },
        {
            department: 'Neurology',
            keywords: ['brain', 'headache', 'migraine', 'dizziness', 'seizure', 'tremor', 'numbness', 'memory', 'paralysis']
        },
        {
            department: 'Orthopedics',
            keywords: ['bone', 'joint', 'knee', 'spine', 'backpain', 'fracture', 'arthritis', 'sprain', 'shoulder']
        },
        {
            department: 'Dermatology',
            keywords: ['skin', 'rash', 'acne', 'itching', 'spots', 'burn', 'eczema', 'hair', 'nails']
        }
    ];

    /**
     * Scans user symptom text and recommends the department and doctor.
     * Uses string cleaning, array mapping, and sorting.
     */
    public async scan(query: string): Promise<SymptomMatchResult> {
        if (!query || query.trim() === '') {
            return { matchedDepartment: 'General Medicine', scorePercentage: 0, recommendedDoctors: [] };
        }

        const cleanedQuery = query.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '');
        const queryWords = cleanedQuery.split(/\s+/);

        let bestDept = 'General Medicine';
        let highestMatchCount = 0;
        let totalKeywordsChecked = 0;

        // Iterate through department structures using array operations
        this.specializations.forEach(spec => {
            const matches = spec.keywords.filter(keyword => 
                cleanedQuery.includes(keyword) || queryWords.includes(keyword)
            );

            if (matches.length > highestMatchCount) {
                highestMatchCount = matches.length;
                bestDept = spec.department;
                totalKeywordsChecked = spec.keywords.length;
            }
        });

        // Compute matching strength as percentage
        const scorePercentage = highestMatchCount > 0 
            ? Math.round((highestMatchCount / totalKeywordsChecked) * 100) 
            : 0;

        // Query recommended doctors under the matched department using Prisma
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorSpecialization: bestDept === 'General Medicine' ? undefined : bestDept
            },
            take: 3
        });

        // Map database doctor fields to standard UI friendly structures
        const mappedDoctors = doctors.map(doc => ({
            id: doc.id,
            name: doc.name,
            specialization: doc.doctorSpecialization || 'General Medicine',
            rating: doc.doctorRating || 4.5,
            experience: doc.doctorExperience || 5,
            avatar: doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
            patients: doc.doctorPatients || 100,
            avgConsultationTime: doc.doctorAvgConsultationTime || 15
        }));

        // Sort recommended doctors using array sorting (highest rating & experience first)
        mappedDoctors.sort((a, b) => b.rating - a.rating || b.experience - a.experience);

        return {
            matchedDepartment: bestDept,
            scorePercentage: scorePercentage > 0 ? scorePercentage : 20, // Default baseline match if query non-empty
            recommendedDoctors: mappedDoctors
        };
    }
}
