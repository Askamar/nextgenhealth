/**
 * AnalyticsEngine Service - OOP Singleton Pattern
 * Aggregates database records to compute hospital performance metrics and percentages.
 */

import { prisma } from '../../config/db';

export interface HealthMetrics {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    vaccineCoveragePercentage: number;
    safetyPassRatePercentage: number;
    queueSlaFulfillmentPercentage: number;
}

export class AnalyticsEngine {
    private static instance: AnalyticsEngine;

    // Private constructor to enforce Singleton pattern
    private constructor() {}

    /**
     * Retrieves the single shared instance of AnalyticsEngine.
     */
    public static getInstance(): AnalyticsEngine {
        if (!AnalyticsEngine.instance) {
            AnalyticsEngine.instance = new AnalyticsEngine();
        }
        return AnalyticsEngine.instance;
    }

    /**
     * Aggregates database records and returns statistical percentages.
     * Uses array operations (filter, reduce) to perform calculations.
     */
    public async getMetrics(): Promise<HealthMetrics> {
        // 1. Fetch raw data from MySQL
        const users = await prisma.user.findMany({});
        const appointments = await prisma.appointment.findMany({});
        const vaccines = await prisma.vaccine.findMany({});
        const prescriptions = await prisma.prescription.findMany({});

        // 2. Count roles using array filter
        const totalPatients = users.filter(u => u.role === 'PATIENT').length;
        const totalDoctors = users.filter(u => u.role === 'DOCTOR').length;
        const totalAppointments = appointments.length;

        // 3. Compute Vaccine Target Coverage %
        // Dispensed capacity is calculated by stock usage: (Total Batch Capacity [100 per entry] - Current Stock)
        const totalDispensed = vaccines.reduce((sum, v) => sum + Math.max(0, 100 - v.stock), 0);
        const totalCapacity = vaccines.length * 100;
        const vaccineCoveragePercentage = totalCapacity > 0 
            ? Math.round((totalDispensed / totalCapacity) * 100)
            : 75; // Default fallback if no inventory

        // 4. Compute Prescription Safety Pass Rate %
        // Safety pass rate represents prescriptions written without flagging safety warnings or bypassing checks
        const totalPrescriptions = prescriptions.length;
        const safePrescriptions = prescriptions.filter(p => !p.safetyFlagged).length;
        const safetyPassRatePercentage = totalPrescriptions > 0
            ? Math.round((safePrescriptions / totalPrescriptions) * 100)
            : 98; // Default baseline safety rate

        // 5. Compute Queue SLA Fulfillment %
        // Ratio of appointments that are completed/confirmed vs. total appointments
        const fulfilledAppointments = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONFIRMED').length;
        const queueSlaFulfillmentPercentage = totalAppointments > 0
            ? Math.round((fulfilledAppointments / totalAppointments) * 100)
            : 85; // Default fallback SLA

        return {
            totalPatients,
            totalDoctors,
            totalAppointments,
            vaccineCoveragePercentage,
            safetyPassRatePercentage: safetyPassRatePercentage > 100 ? 100 : safetyPassRatePercentage,
            queueSlaFulfillmentPercentage
        };
    }
}
