/**
 * DSA-Powered Controller
 * 
 * API endpoints that utilize Data Structures and Algorithms
 */

import { Request, Response } from 'express';
import {
    initializeDrugSearch,
    autocompleteDrug,
    getDrugWithCache,
    checkMultipleInteractions,
    getCacheStats
} from '../services/drugSearchService';
import { recommendDoctors, findSymptomPath } from '../services/doctorRecommendationService';
import { PriorityQueue, SlidingWindow, calculatePriority } from '../utils/dataStructures';

// Initialize drug search on first request
let drugSearchInitialized = false;

/**
 * GET /api/dsa/drug/autocomplete?q=asp
 * 
 * Drug name autocomplete using Trie
 * Time Complexity: O(p + k) where p=prefix length, k=results
 */
export const drugAutocomplete = async (req: Request, res: Response) => {
    try {
        if (!drugSearchInitialized) {
            await initializeDrugSearch();
            drugSearchInitialized = true;
        }

        const { q, limit = 10 } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ message: 'Query parameter "q" is required' });
        }

        const startTime = performance.now();
        const suggestions = autocompleteDrug(q, Number(limit));
        const endTime = performance.now();

        res.json({
            query: q,
            suggestions,
            count: suggestions.length,
            algorithm: 'Trie-based prefix search',
            complexity: 'O(p + k)',
            executionTimeMs: (endTime - startTime).toFixed(3)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/dsa/drug/:name
 * 
 * Get drug info with LRU Cache
 * Time Complexity: O(1) for cache hit
 */
export const getDrugCached = async (req: Request, res: Response) => {
    try {
        if (!drugSearchInitialized) {
            await initializeDrugSearch();
            drugSearchInitialized = true;
        }

        const { name } = req.params;

        const startTime = performance.now();
        const drug = await getDrugWithCache(name);
        const endTime = performance.now();

        if (!drug) {
            return res.status(404).json({ message: 'Drug not found' });
        }

        const stats = getCacheStats();

        res.json({
            drug,
            algorithm: 'LRU Cache lookup',
            complexity: 'O(1) for cache hit',
            executionTimeMs: (endTime - startTime).toFixed(3),
            cacheStats: stats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/dsa/drug/interactions
 * Body: { drugs: ["aspirin", "warfarin"] }
 * 
 * Check drug interactions using HashMap
 * Time Complexity: O(n²) pairs, O(1) per lookup
 */
export const checkInteractions = async (req: Request, res: Response) => {
    try {
        if (!drugSearchInitialized) {
            await initializeDrugSearch();
            drugSearchInitialized = true;
        }

        const { drugs } = req.body;

        if (!Array.isArray(drugs) || drugs.length < 2) {
            return res.status(400).json({ message: 'At least 2 drugs required' });
        }

        const startTime = performance.now();
        const interactions = checkMultipleInteractions(drugs);
        const endTime = performance.now();

        res.json({
            drugs,
            interactions,
            count: interactions.length,
            algorithm: 'HashMap O(1) lookup',
            complexity: `O(n²) pairs = ${(drugs.length * (drugs.length - 1)) / 2} lookups, each O(1)`,
            executionTimeMs: (endTime - startTime).toFixed(3)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/dsa/doctor/recommend
 * Body: { symptoms: ["chest pain", "shortness of breath"] }
 * 
 * Recommend doctors using Graph + BFS
 * Time Complexity: O(V + E) for graph traversal
 */
export const recommendDoctor = async (req: Request, res: Response) => {
    try {
        const { symptoms, limit = 5 } = req.body;

        if (!Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ message: 'Symptoms array required' });
        }

        const startTime = performance.now();
        const recommendations = await recommendDoctors(symptoms, Number(limit));
        const endTime = performance.now();

        // Get symptom paths for explanation
        const paths = symptoms.map(s => ({
            symptom: s,
            path: findSymptomPath(s)
        }));

        res.json({
            symptoms,
            recommendations,
            symptomPaths: paths,
            algorithm: 'Graph BFS + Weighted Scoring',
            complexity: 'O(V + E) for graph traversal',
            executionTimeMs: (endTime - startTime).toFixed(3)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/dsa/queue/priority
 * Body: { patients: [{ name, age, isEmergency, severity, waitTimeMinutes }] }
 * 
 * Demonstrate Priority Queue (Heap)
 * Time Complexity: O(n log n) for n insertions
 */
export const priorityQueueDemo = async (req: Request, res: Response) => {
    try {
        const { patients } = req.body;

        if (!Array.isArray(patients)) {
            return res.status(400).json({ message: 'Patients array required' });
        }

        const startTime = performance.now();

        // Create priority queue
        const pq = new PriorityQueue<{
            patientName: string;
            priority: number;
            details: any;
        }>();

        // Add all patients
        for (const patient of patients) {
            const priority = calculatePriority(
                patient.isEmergency || false,
                patient.age || 30,
                patient.severity || 5,
                patient.waitTimeMinutes || 0
            );

            pq.enqueue({
                patientName: patient.name,
                priority,
                details: patient
            });
        }

        // Extract in priority order
        const orderedQueue = [];
        while (!pq.isEmpty()) {
            const item = pq.dequeue();
            if (item) orderedQueue.push(item);
        }

        const endTime = performance.now();

        res.json({
            inputCount: patients.length,
            orderedQueue,
            algorithm: 'Min-Heap Priority Queue',
            complexity: 'O(n log n) for n insertions + extractions',
            executionTimeMs: (endTime - startTime).toFixed(3)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/dsa/analytics/sliding-window
 * Body: { values: [10, 15, 12, 18, 20], windowSize: 3 }
 * 
 * Calculate moving averages using Sliding Window
 * Time Complexity: O(n) for n values
 */
export const slidingWindowDemo = async (req: Request, res: Response) => {
    try {
        const { values, windowSize = 3 } = req.body;

        if (!Array.isArray(values)) {
            return res.status(400).json({ message: 'Values array required' });
        }

        const startTime = performance.now();

        const sw = new SlidingWindow(Number(windowSize));
        const movingAverages = [];

        for (const value of values) {
            const avg = sw.add(Number(value));
            movingAverages.push({
                value,
                window: sw.getWindow(),
                movingAverage: Math.round(avg * 100) / 100
            });
        }

        const endTime = performance.now();

        res.json({
            inputValues: values,
            windowSize,
            movingAverages,
            algorithm: 'Sliding Window',
            complexity: 'O(n) - each add operation is O(1)',
            executionTimeMs: (endTime - startTime).toFixed(3)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/dsa/stats
 * 
 * Get DSA system statistics
 */
export const getDsaStats = async (req: Request, res: Response) => {
    try {
        const stats = drugSearchInitialized ? getCacheStats() : { initialized: false };

        res.json({
            drugSearch: stats,
            dataStructures: [
                { name: 'Trie', usage: 'Drug name autocomplete', complexity: 'O(m) insert/search' },
                { name: 'LRU Cache', usage: 'Drug info caching', complexity: 'O(1) get/put' },
                { name: 'HashMap', usage: 'Drug interaction lookup', complexity: 'O(1) lookup' },
                { name: 'Priority Queue', usage: 'Patient queue ordering', complexity: 'O(log n) insert/extract' },
                { name: 'Graph', usage: 'Doctor recommendation', complexity: 'O(V+E) BFS/DFS' },
                { name: 'Sliding Window', usage: 'Analytics moving average', complexity: 'O(1) per operation' }
            ]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
