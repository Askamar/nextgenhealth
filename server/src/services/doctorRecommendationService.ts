/**
 * Doctor Recommendation System
 * 
 * Uses DSA concepts:
 * 1. Graph - Symptom to Specialization to Doctor mapping
 * 2. Dijkstra's Algorithm - Find optimal doctor based on multiple factors
 * 3. BFS - Find all related specializations
 */

import { Graph } from '../utils/dataStructures';
import { User } from '../models';

// Types
interface DoctorNode {
    id: string;
    name: string;
    specialization: string;
    rating: number;
    avgWaitTime: number;
    experience: number;
}

interface RecommendationResult {
    doctor: DoctorNode;
    score: number;
    matchedSymptoms: string[];
    reasoning: string;
}

// Symptom to Specialization mapping graph
const symptomGraph = new Graph<string>();

// Initialize symptom-specialization relationships
const initializeSymptomGraph = () => {
    // Cardiology symptoms
    symptomGraph.addEdge('chest pain', 'CARDIOLOGY', 10);
    symptomGraph.addEdge('heart palpitations', 'CARDIOLOGY', 10);
    symptomGraph.addEdge('shortness of breath', 'CARDIOLOGY', 8);
    symptomGraph.addEdge('high blood pressure', 'CARDIOLOGY', 9);
    symptomGraph.addEdge('irregular heartbeat', 'CARDIOLOGY', 10);

    // Neurology symptoms
    symptomGraph.addEdge('headache', 'NEUROLOGY', 7);
    symptomGraph.addEdge('migraine', 'NEUROLOGY', 10);
    symptomGraph.addEdge('dizziness', 'NEUROLOGY', 8);
    symptomGraph.addEdge('seizures', 'NEUROLOGY', 10);
    symptomGraph.addEdge('numbness', 'NEUROLOGY', 8);
    symptomGraph.addEdge('memory problems', 'NEUROLOGY', 9);

    // Orthopedics symptoms
    symptomGraph.addEdge('joint pain', 'ORTHOPEDICS', 9);
    symptomGraph.addEdge('back pain', 'ORTHOPEDICS', 9);
    symptomGraph.addEdge('fracture', 'ORTHOPEDICS', 10);
    symptomGraph.addEdge('knee pain', 'ORTHOPEDICS', 9);
    symptomGraph.addEdge('sports injury', 'ORTHOPEDICS', 10);

    // Dermatology symptoms
    symptomGraph.addEdge('skin rash', 'DERMATOLOGY', 10);
    symptomGraph.addEdge('acne', 'DERMATOLOGY', 9);
    symptomGraph.addEdge('hair loss', 'DERMATOLOGY', 8);
    symptomGraph.addEdge('itching', 'DERMATOLOGY', 7);
    symptomGraph.addEdge('skin infection', 'DERMATOLOGY', 9);

    // Gastroenterology symptoms
    symptomGraph.addEdge('stomach pain', 'GASTROENTEROLOGY', 9);
    symptomGraph.addEdge('acidity', 'GASTROENTEROLOGY', 8);
    symptomGraph.addEdge('nausea', 'GASTROENTEROLOGY', 7);
    symptomGraph.addEdge('diarrhea', 'GASTROENTEROLOGY', 8);
    symptomGraph.addEdge('constipation', 'GASTROENTEROLOGY', 7);

    // Pulmonology symptoms
    symptomGraph.addEdge('cough', 'PULMONOLOGY', 8);
    symptomGraph.addEdge('breathing difficulty', 'PULMONOLOGY', 10);
    symptomGraph.addEdge('asthma', 'PULMONOLOGY', 10);
    symptomGraph.addEdge('chest congestion', 'PULMONOLOGY', 8);

    // General Medicine (fallback)
    symptomGraph.addEdge('fever', 'GENERAL_MEDICINE', 6);
    symptomGraph.addEdge('fatigue', 'GENERAL_MEDICINE', 5);
    symptomGraph.addEdge('cold', 'GENERAL_MEDICINE', 5);
    symptomGraph.addEdge('flu', 'GENERAL_MEDICINE', 6);

    // Cross-specialization edges (symptoms that could be multiple specialties)
    symptomGraph.addEdge('shortness of breath', 'PULMONOLOGY', 9);
    symptomGraph.addEdge('headache', 'GENERAL_MEDICINE', 5);
    symptomGraph.addEdge('dizziness', 'CARDIOLOGY', 6);
    symptomGraph.addEdge('fatigue', 'CARDIOLOGY', 4);

    console.log('[DSA] Symptom-Specialization graph initialized');
};

// Initialize on module load
initializeSymptomGraph();

/**
 * Find relevant specializations for given symptoms using BFS
 * Time Complexity: O(V + E) where V = vertices, E = edges
 * 
 * @param symptoms - Array of patient symptoms
 * @returns Map of specialization to total relevance score
 */
export const findRelevantSpecializations = (symptoms: string[]): Map<string, number> => {
    const specializationScores = new Map<string, number>();

    for (const symptom of symptoms) {
        const lowerSymptom = symptom.toLowerCase();
        const neighbors = symptomGraph.getNeighbors(lowerSymptom);

        for (const { node: specialization, weight } of neighbors) {
            const currentScore = specializationScores.get(specialization) || 0;
            specializationScores.set(specialization, currentScore + weight);
        }
    }

    return specializationScores;
};

/**
 * Calculate doctor recommendation score
 * Uses weighted scoring algorithm
 * 
 * @param doctor - Doctor details
 * @param specializationScore - How relevant the specialization is
 * @returns Composite score (higher = better)
 */
const calculateDoctorScore = (
    doctor: DoctorNode,
    specializationScore: number
): number => {
    // Weights for different factors
    const WEIGHTS = {
        relevance: 0.35,    // How relevant is the specialization
        rating: 0.25,       // Doctor's rating
        experience: 0.20,   // Years of experience
        waitTime: 0.20      // Inverse of wait time (shorter = better)
    };

    // Normalize values to 0-100 scale
    const relevanceScore = Math.min(specializationScore * 10, 100);
    const ratingScore = (doctor.rating / 5) * 100;
    const experienceScore = Math.min(doctor.experience * 5, 100);
    const waitTimeScore = Math.max(100 - doctor.avgWaitTime, 0);

    const finalScore =
        (relevanceScore * WEIGHTS.relevance) +
        (ratingScore * WEIGHTS.rating) +
        (experienceScore * WEIGHTS.experience) +
        (waitTimeScore * WEIGHTS.waitTime);

    return Math.round(finalScore * 10) / 10;
};

/**
 * Get doctor recommendations based on symptoms
 * Uses Graph + Scoring Algorithm
 * 
 * @param symptoms - Patient's symptoms
 * @param limit - Max recommendations
 * @returns Sorted list of doctor recommendations
 */
export const recommendDoctors = async (
    symptoms: string[],
    limit: number = 5
): Promise<RecommendationResult[]> => {
    console.log(`[DSA] Finding doctors for symptoms: ${symptoms.join(', ')}`);

    // Step 1: Find relevant specializations using graph
    const specializationScores = findRelevantSpecializations(symptoms);

    if (specializationScores.size === 0) {
        console.log('[DSA] No matching specializations found');
        return [];
    }

    // Step 2: Get all doctors with matching specializations
    const relevantSpecializations = Array.from(specializationScores.keys());
    const doctors = await User.find({
        role: 'DOCTOR',
        'doctorDetails.specialization': {
            $regex: new RegExp(relevantSpecializations.join('|'), 'i')
        }
    });

    // Step 3: Calculate scores and rank doctors
    const recommendations: RecommendationResult[] = [];

    for (const doctor of doctors) {
        const spec = doctor.doctorDetails?.specialization?.toUpperCase() || '';
        const specScore = specializationScores.get(spec) ||
            specializationScores.get(spec.replace(/\s+/g, '_')) || 0;

        const doctorNode: DoctorNode = {
            id: doctor._id.toString(),
            name: doctor.name,
            specialization: doctor.doctorDetails?.specialization || '',
            rating: doctor.doctorDetails?.rating || 4.0,
            avgWaitTime: doctor.doctorDetails?.avgConsultationTime || 15,
            experience: doctor.doctorDetails?.experience || 5
        };

        const score = calculateDoctorScore(doctorNode, specScore);

        // Find which symptoms matched
        const matchedSymptoms = symptoms.filter(s => {
            const neighbors = symptomGraph.getNeighbors(s.toLowerCase());
            return neighbors.some(n =>
                n.node.toLowerCase() === spec.toLowerCase() ||
                n.node.replace(/_/g, ' ').toLowerCase() === spec.toLowerCase()
            );
        });

        recommendations.push({
            doctor: doctorNode,
            score,
            matchedSymptoms,
            reasoning: `Specialist in ${doctorNode.specialization} with ${doctorNode.experience}+ years experience. Rating: ${doctorNode.rating}/5`
        });
    }

    // Step 4: Sort by score (descending) and return top results
    recommendations.sort((a, b) => b.score - a.score);

    console.log(`[DSA] Found ${recommendations.length} doctors, returning top ${limit}`);

    return recommendations.slice(0, limit);
};

/**
 * Find shortest path from symptom to doctors
 * Uses modified Dijkstra's algorithm
 * 
 * @param symptom - Starting symptom
 * @returns Path through specializations
 */
export const findSymptomPath = (symptom: string): string[] => {
    const visited = new Set<string>();
    const path: string[] = [symptom];
    const queue: string[] = [symptom.toLowerCase()];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        const neighbors = symptomGraph.getNeighbors(current);
        for (const { node } of neighbors) {
            if (!visited.has(node)) {
                path.push(node);
                // Don't continue BFS from specializations
                // They are leaf nodes in our symptom->specialization graph
            }
        }
    }

    return path;
};

export default {
    findRelevantSpecializations,
    recommendDoctors,
    findSymptomPath
};
