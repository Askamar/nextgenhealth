/**
 * DSA Routes
 * 
 * API routes demonstrating Data Structures and Algorithms
 */

import { Router } from 'express';
import {
    drugAutocomplete,
    getDrugCached,
    checkInteractions,
    recommendDoctor,
    priorityQueueDemo,
    slidingWindowDemo,
    getDsaStats
} from '../controllers/dsaController';

const router = Router();

// Drug Search with DSA
router.get('/drug/autocomplete', drugAutocomplete);      // Trie
router.get('/drug/:name', getDrugCached);                // LRU Cache
router.post('/drug/interactions', checkInteractions);    // HashMap

// Doctor Recommendation
router.post('/doctor/recommend', recommendDoctor);       // Graph + BFS

// Queue Management
router.post('/queue/priority', priorityQueueDemo);       // Priority Queue (Heap)

// Analytics
router.post('/analytics/sliding-window', slidingWindowDemo);  // Sliding Window

// Stats
router.get('/stats', getDsaStats);

export default router;
