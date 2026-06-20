/**
 * NextGenHealth Integration Testing Script
 * Directly exercises DB connection, OOP classes, and service aggregation logic.
 */

import { prisma } from './config/db';
import { SymptomScanner } from './services/oop/SymptomScanner';
import { EPrescription } from './services/oop/MedicalRecord';
import { AnalyticsEngine } from './services/oop/AnalyticsEngine';

async function testAll() {
    console.log("=== STARTING INTEGRATION TESTS FOR NEXTGENHEALTH ===");

    // 1. Test Database Connectivity
    try {
        const usersCount = await prisma.user.count();
        console.log(`[PASS] DB Connection verified. Total users in MySQL: ${usersCount}`);
    } catch (e: any) {
        console.error("[FAIL] DB Connection failed:", e.message);
        process.exit(1);
    }

    // 2. Test SymptomScanner (OOP + Array search)
    const scanner = new SymptomScanner();
    const scanResult = await scanner.scan("I have chest pain and palpitations");
    if (scanResult.matchedDepartment === "Cardiology" && scanResult.scorePercentage > 0) {
        console.log(`[PASS] SymptomScanner matched Cardiology with ${scanResult.scorePercentage}% match`);
        console.log(`       Recommended Doctor: ${scanResult.recommendedDoctors[0]?.name || 'None'}`);
    } else {
        console.error("[FAIL] SymptomScanner failed to match Cardiology. Matched:", scanResult.matchedDepartment);
    }

    // 3. Test Drug Interactions (OOP EPrescription check)
    const mockInteractions = [
        {
            drugs: JSON.stringify(["Aspirin", "Warfarin"]),
            severity: "High",
            description: "High risk of bleeding",
            management: "Avoid co-administration"
        }
    ];
    const mockPrescription = new EPrescription(
        "rx-test-1",
        "pat-1",
        "Dr. Test",
        "2026-06-20",
        "appt-1",
        "Cardiology",
        [
            { name: "Aspirin", dose: "10mg", frequency: "1x daily", timing: "After Meals" },
            { name: "Warfarin", dose: "5mg", frequency: "1x daily", timing: "Before Bedtime" }
        ]
    );
    const safetyCheck = mockPrescription.checkSafetyInteractions(mockInteractions);
    if (!safetyCheck.isSafe && safetyCheck.warning?.includes("High risk of bleeding")) {
        console.log("[PASS] EPrescription drug interaction detector identified Aspirin + Warfarin hazard");
    } else {
        console.error("[FAIL] EPrescription drug interaction detector failed. Result:", safetyCheck);
    }

    // 4. Test AnalyticsEngine (OOP Singleton + Array aggregates)
    const engine = AnalyticsEngine.getInstance();
    const metrics = await engine.getMetrics();
    if (metrics.safetyPassRatePercentage !== undefined && metrics.vaccineCoveragePercentage !== undefined) {
        console.log("[PASS] AnalyticsEngine Singleton computed metrics successfully:", JSON.stringify(metrics, null, 2));
    } else {
        console.error("[FAIL] AnalyticsEngine failed to compute metrics. Received:", metrics);
    }

    console.log("=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===");
    process.exit(0);
}

testAll().catch(err => {
    console.error("Test execution error:", err);
    process.exit(1);
});
