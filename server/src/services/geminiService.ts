
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Drug } from '../models'; // We will cache findings

dotenv.config();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ model: "" });

export const getDrugDetailsFromAI = async (drugName: string) => {
    try {
        const prompt = `Provide detailed medical information for the drug "${drugName}" in JSON format. 
        Include the following fields: 
        - name (Standardized name)
        - category (e.g. Analgesic, Antibiotic)
        - description (Brief summary)
        - dosageTiming (Short instruction e.g. "Take with food")
        - minDose (e.g. "200mg")
        - maxDose (e.g. "3000mg/day")
        - sideEffects (Common side effects)
        
        Ensure the output is strictly valid JSON without markdown formatting. If the drug is not real or dangerous/unknown, return null.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return data;
    } catch (error) {
        console.error("Error fetching drug details from AI:", error);
        return null;
    }
};

export const checkInteractionsWithAI = async (drugNames: string[]) => {
    try {
        const list = drugNames.join(', ');
        const prompt = `Analyze potential drug interactions between the following medicines: ${list}.
        Return a JSON object with a key "interactions" which is an array of objects.
        Each object should have:
        - drugs: [drug1, drug2] (The pair causing interaction)
        - severity: "Mild", "Moderate", or "Severe"
        - description: Brief explanation of the interaction effect.
        - management: Recommendation (e.g. "Monitor closely", "Avoid combination").

        If no interactions found, return { "interactions": [] }.
        Ensure output is strict JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error checking interactions with AI:", error);
        return { interactions: [] };
    }
};
