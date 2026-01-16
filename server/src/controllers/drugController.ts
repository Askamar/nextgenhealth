import { Request, Response } from 'express';
import { Drug, DrugInteraction } from '../models';
import { getDrugDetailsFromAI, checkInteractionsWithAI } from '../services/groqService';

export const getDrugs = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }
        const drugs = await Drug.find({ name: { $regex: query as string, $options: 'i' } }).limit(10);
        res.json(drugs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getDrugInfo = async (req: Request, res: Response) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ message: 'Drug name required' });

        const drugName = name as string;

        // 1. Check DB
        let drug = await Drug.findOne({ name: { $regex: new RegExp(`^${drugName}$`, 'i') } });

        if (drug) {
            return res.json(drug);
        }

        // 2. Fetch from Groq AI
        console.log(`Fetching info for ${drugName} from Groq AI...`);
        const aiData = await getDrugDetailsFromAI(drugName);
        console.log('AI Response:', JSON.stringify(aiData));

        if (aiData && aiData.name) {
            // Save to DB for future caching
            try {
                drug = await Drug.create(aiData);
                return res.json(drug);
            } catch (dbError) {
                console.error('DB Save Error:', dbError);
                // Return the AI data even if DB save fails
                return res.json(aiData);
            }
        }

        res.status(404).json({ message: 'Drug information not found' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const checkInteractions = async (req: Request, res: Response) => {
    try {
        const { drugs } = req.body; // Array of drug names
        if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
            return res.status(400).json({ message: 'At least two drugs are required to check interactions.' });
        }

        // 1. Try Local DB (Strict Exact Match Pairs)
        // ... (Existing logic kept simple or purely rely on AI for "smartness"?)
        // The user wants "any new medicine". DB is limited. 
        // Best approach: Use AI for interaction checking as it covers everything.

        console.log(`Checking interactions for: ${drugs.join(', ')} via Groq AI...`);
        const aiResult = await checkInteractionsWithAI(drugs);

        res.json(aiResult);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
