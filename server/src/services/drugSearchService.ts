/**
 * Smart Drug Search Service
 * 
 * Uses DSA concepts:
 * 1. Trie - For fast autocomplete
 * 2. LRU Cache - For caching drug info
 * 3. HashMap - For O(1) drug interaction lookup
 */

import { Trie, LRUCache } from '../utils/dataStructures';
import { Drug, DrugInteraction } from '../models';

// Initialize data structures
const drugTrie = new Trie();
const drugCache = new LRUCache<string, any>(100); // Cache last 100 drugs
const interactionMap = new Map<string, any>(); // HashMap for O(1) interaction lookup

// Flag to track if initialized
let isInitialized = false;

/**
 * Initialize the drug search system
 * Loads all drugs into Trie and interactions into HashMap
 */
export const initializeDrugSearch = async (): Promise<void> => {
    if (isInitialized) return;

    try {
        console.log('[DSA] Initializing drug search system...');

        // Load all drugs into Trie - O(n * m) where n = drugs, m = avg name length
        const drugs = await Drug.find({});
        for (const drug of drugs) {
            drugTrie.insert(drug.name.toLowerCase(), {
                id: drug._id,
                name: drug.name,
                category: drug.category
            });
        }
        console.log(`[DSA] Loaded ${drugs.length} drugs into Trie`);

        // Load all interactions into HashMap - O(n)
        const interactions = await DrugInteraction.find({});
        for (const interaction of interactions) {
            // Create keys for both orderings: "aspirin+warfarin" and "warfarin+aspirin"
            const drugs = interaction.drugs.map((d: string) => d.toLowerCase()).sort();
            const key = drugs.join('+');
            interactionMap.set(key, {
                severity: interaction.severity,
                description: interaction.description,
                management: interaction.management
            });
        }
        console.log(`[DSA] Loaded ${interactions.length} interactions into HashMap`);

        isInitialized = true;
        console.log('[DSA] Drug search system initialized successfully');

    } catch (error) {
        console.error('[DSA] Failed to initialize drug search:', error);
    }
};

/**
 * Autocomplete drug names using Trie
 * Time Complexity: O(p + k) where p = prefix length, k = results
 * 
 * @param prefix - Search prefix
 * @param limit - Max results
 * @returns Array of matching drug suggestions
 */
export const autocompleteDrug = (prefix: string, limit: number = 10): { name: string; category?: string }[] => {
    if (!prefix || prefix.length < 2) return [];

    const results = drugTrie.autocomplete(prefix.toLowerCase(), limit);

    return results.map(r => ({
        name: r.data?.name || r.word,
        category: r.data?.category
    }));
};

/**
 * Get drug info with LRU Cache
 * Time Complexity: O(1) for cache hit, O(n) for DB lookup
 * 
 * @param drugName - Drug name to lookup
 * @returns Drug information or null
 */
export const getDrugWithCache = async (drugName: string): Promise<any | null> => {
    const cacheKey = drugName.toLowerCase();

    // Check cache first - O(1)
    const cached = drugCache.get(cacheKey);
    if (cached) {
        console.log(`[DSA] Cache HIT for drug: ${drugName}`);
        return cached;
    }

    console.log(`[DSA] Cache MISS for drug: ${drugName}`);

    // Fetch from database
    const drug = await Drug.findOne({
        name: { $regex: new RegExp(`^${drugName}$`, 'i') }
    });

    if (drug) {
        // Store in cache - O(1)
        drugCache.put(cacheKey, drug);
    }

    return drug;
};

/**
 * Check drug interaction using HashMap
 * Time Complexity: O(1) - Constant time lookup!
 * 
 * @param drug1 - First drug name
 * @param drug2 - Second drug name
 * @returns Interaction details or null
 */
export const checkInteractionFast = (drug1: string, drug2: string): any | null => {
    // Sort to ensure consistent key ordering
    const drugs = [drug1.toLowerCase(), drug2.toLowerCase()].sort();
    const key = drugs.join('+');

    const interaction = interactionMap.get(key);

    if (interaction) {
        console.log(`[DSA] Interaction found (O(1)): ${key}`);
        return {
            drug1: drugs[0],
            drug2: drugs[1],
            ...interaction
        };
    }

    return null;
};

/**
 * Check multiple drug interactions
 * Time Complexity: O(n²) where n = number of drugs
 * But each lookup is O(1) thanks to HashMap
 * 
 * @param drugs - Array of drug names
 * @returns Array of found interactions
 */
export const checkMultipleInteractions = (drugs: string[]): any[] => {
    const interactions: any[] = [];

    // Check all pairs - O(n²) pairs, but O(1) per lookup
    for (let i = 0; i < drugs.length; i++) {
        for (let j = i + 1; j < drugs.length; j++) {
            const interaction = checkInteractionFast(drugs[i], drugs[j]);
            if (interaction) {
                interactions.push(interaction);
            }
        }
    }

    // Sort by severity (Severe > Moderate > Mild)
    const severityOrder = { 'Severe': 0, 'Moderate': 1, 'Mild': 2 };
    interactions.sort((a, b) =>
        (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
        (severityOrder[b.severity as keyof typeof severityOrder] || 3)
    );

    return interactions;
};

/**
 * Add new drug to Trie (when fetched from AI)
 * Time Complexity: O(m) where m = drug name length
 * 
 * @param drug - Drug object
 */
export const addDrugToSearchIndex = (drug: { name: string; category: string }): void => {
    drugTrie.insert(drug.name.toLowerCase(), {
        name: drug.name,
        category: drug.category
    });
    console.log(`[DSA] Added drug to Trie: ${drug.name}`);
};

/**
 * Add new interaction to HashMap
 * Time Complexity: O(1)
 * 
 * @param interaction - Interaction object
 */
export const addInteractionToIndex = (interaction: {
    drugs: string[];
    severity: string;
    description: string;
    management: string
}): void => {
    const drugs = interaction.drugs.map(d => d.toLowerCase()).sort();
    const key = drugs.join('+');

    interactionMap.set(key, {
        severity: interaction.severity,
        description: interaction.description,
        management: interaction.management
    });

    console.log(`[DSA] Added interaction to HashMap: ${key}`);
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => ({
    cacheSize: drugCache.size(),
    trieInitialized: isInitialized,
    interactionCount: interactionMap.size
});

export default {
    initializeDrugSearch,
    autocompleteDrug,
    getDrugWithCache,
    checkInteractionFast,
    checkMultipleInteractions,
    addDrugToSearchIndex,
    addInteractionToIndex,
    getCacheStats
};
