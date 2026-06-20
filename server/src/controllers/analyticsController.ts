/**
 * Analytics and Health Check Controller
 * Exposes OOP analytics engines and text symptom scanners as endpoints.
 */

import { Request, Response } from 'express';
import { AnalyticsEngine } from '../services/oop/AnalyticsEngine';
import { SymptomScanner } from '../services/oop/SymptomScanner';

/**
 * Returns computed hospital metrics and coverage percentages using Singleton AnalyticsEngine.
 */
export const getHealthMetrics = async (req: Request, res: Response) => {
    try {
        const engine = AnalyticsEngine.getInstance();
        const metrics = await engine.getMetrics();
        res.json(metrics);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Scans symptom text matching keywords to departments and doctors using SymptomScanner.
 */
export const analyzeSymptoms = async (req: Request, res: Response) => {
    try {
        const query = (req.query.query as string) || (req.body.query as string) || '';
        const scanner = new SymptomScanner();
        const results = await scanner.scan(query);
        res.json(results);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
