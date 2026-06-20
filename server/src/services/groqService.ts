
import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Use a fast and capable model (Groq available models)
const MODEL = "llama-3.3-70b-versatile";

export const getDrugDetailsFromAI = async (drugName: string) => {
    try {
        console.log(`[Groq] Requesting info for: ${drugName}`);

        const prompt = `Provide detailed medical information for the drug "${drugName}" in JSON format.
        If the spelling is slightly wrong, please correct it and provide info for the correct drug.
        
        Include the following fields: 
        - name (Corrected/Standardized name)
        - category (e.g. Analgesic, Antibiotic, Antihistamine)
        - description (Brief summary of what it treats)
        - dosageTiming (Short instruction e.g. "Take with food", "Take before bed")
        - minDose (e.g. "5mg", "200mg")
        - maxDose (e.g. "10mg/day", "3000mg/day")
        - sideEffects (Common side effects, comma separated)
        
        Return ONLY valid JSON, no markdown, no backticks, no explanation. Just the JSON object.
        If the drug does not exist at all, return: {"error": "unknown drug"}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a pharmaceutical database that returns only valid JSON. Correct minor spelling mistakes in drug names." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            temperature: 0.1,
        });

        const text = completion.choices[0]?.message?.content || "";
        console.log(`[Groq] Raw response: ${text.substring(0, 200)}...`);

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Sometimes LLMs add text before/after, try to extract JSON
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        let parsed;
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        } else {
            parsed = JSON.parse(jsonStr);
        }

        // Check if it's an error response
        if (parsed.error) {
            console.log(`[Groq] Drug not found: ${parsed.error}`);
            return null;
        }

        return parsed;
    } catch (error: any) {
        console.error("[Groq] Error fetching drug details:", error.message || error);
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
        Ensure the output is strictly valid JSON without markdown formatting. Return ONLY the JSON object.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a medical assistant that outputs only valid JSON." },
                { role: "user", content: prompt }
            ],
            model: MODEL,
            temperature: 0.1,
        });

        const text = completion.choices[0]?.message?.content || "";

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error checking interactions with Groq:", error);
        return { interactions: [] };
    }
};
