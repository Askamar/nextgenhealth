/**
 * HTTP Endpoint Verification Script
 * Validates actual running Express API endpoints.
 */

import { prisma } from './config/db';

const API_BASE = 'http://localhost:5000/api';

async function runHttpTests() {
    console.log("=== STARTING HTTP API VERIFICATION ===");

    // 1. Fetch some info from database first to use valid IDs
    const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
    const patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });

    if (!doctor || !patient) {
        console.error("[FAIL] Could not find doctor or patient in database. Please seed the database first.");
        process.exit(1);
    }

    console.log(`[INFO] Found doctor: ${doctor.name} (${doctor.id})`);
    console.log(`[INFO] Found patient: ${patient.name} (${patient.id})`);

    // 2. Test Login
    try {
        console.log("\nTesting login endpoint...");
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: doctor.email,
                password: 'password123'
            })
        });

        const loginData = await loginRes.json() as any;
        if (loginRes.ok && loginData.token) {
            console.log(`[PASS] Login successful for doctor. Token received: ${loginData.token.slice(0, 15)}...`);
        } else {
            console.error(`[FAIL] Login failed:`, loginData);
        }
    } catch (e: any) {
        console.error(`[FAIL] Login request error:`, e.message);
    }

    // 3. Test Health Metrics
    try {
        console.log("\nTesting health metrics endpoint...");
        const metricsRes = await fetch(`${API_BASE}/health-metrics`);
        const metricsData = await metricsRes.json() as any;
        if (metricsRes.ok && typeof metricsData.vaccineCoveragePercentage === 'number') {
            console.log(`[PASS] Health metrics retrieved successfully. Vaccine Coverage: ${metricsData.vaccineCoveragePercentage}%, Safety Pass: ${metricsData.safetyPassRatePercentage}%`);
        } else {
            console.error(`[FAIL] Health metrics request failed:`, metricsData);
        }
    } catch (e: any) {
        console.error(`[FAIL] Health metrics request error:`, e.message);
    }

    // 4. Test Symptom Analysis
    try {
        console.log("\nTesting symptom analyze endpoint...");
        const symptomRes = await fetch(`${API_BASE}/symptom-analyze?query=heart%20palpitations%20chest%20pain`);
        const symptomData = await symptomRes.json() as any;
        if (symptomRes.ok && symptomData.matchedDepartment === 'Cardiology') {
            console.log(`[PASS] Symptom analysis returned department: ${symptomData.matchedDepartment} (Match score: ${symptomData.scorePercentage}%)`);
            console.log(`       Recommended doctors: ${symptomData.recommendedDoctors.map((d: any) => d.name).join(', ')}`);
        } else {
            console.error(`[FAIL] Symptom analysis request failed:`, symptomData);
        }
    } catch (e: any) {
        console.error(`[FAIL] Symptom analysis request error:`, e.message);
    }

    // 5. Test Creating Prescription with drug warnings
    try {
        console.log("\nTesting prescription creation with interaction warning...");
        const rxPayload = {
            appointmentId: "mock-appt-123",
            patientId: patient.id,
            patientName: patient.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            department: "Cardiology",
            date: new Date().toISOString().split('T')[0],
            medications: [
                { name: "Aspirin", dose: "100mg", frequency: "1x daily", timing: "After Meals" },
                { name: "Warfarin", dose: "5mg", frequency: "1x daily", timing: "Before Bedtime" }
            ],
            notes: "Testing interaction warnings.",
            safetyFlagged: false
        };

        const rxRes = await fetch(`${API_BASE}/prescriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rxPayload)
        });

        const rxData = await rxRes.json() as any;
        if (rxRes.ok && rxData.prescription) {
            console.log(`[PASS] Prescription created successfully. ID: ${rxData.prescription.id}`);
            console.log(`       Safety Flagged by system: ${rxData.prescription.safetyFlagged}`);
            console.log(`       Safety warning message: ${rxData.safetyCheck.warning}`);
            if (rxData.prescription.safetyFlagged === true && !rxData.safetyCheck.isSafe) {
                console.log(`[PASS] Correctly flagged drug interaction warning.`);
            } else {
                console.error(`[FAIL] Drug interaction warning was NOT flagged.`);
            }
        } else {
            console.error(`[FAIL] Prescription creation failed:`, rxData);
        }
    } catch (e: any) {
        console.error(`[FAIL] Prescription creation request error:`, e.message);
    }

    // 6. Test Querying Prescriptions back
    try {
        console.log("\nTesting get patient prescriptions endpoint...");
        const getRxRes = await fetch(`${API_BASE}/prescriptions/patient/${patient.id}`);
        const getRxData = await getRxRes.json() as any;
        if (getRxRes.ok && Array.isArray(getRxData)) {
            console.log(`[PASS] Fetched ${getRxData.length} prescriptions for patient.`);
            const createdRx = getRxData.find((rx: any) => rx.appointmentId === "mock-appt-123");
            if (createdRx) {
                console.log(`[PASS] Verification script successfully found the created prescription.`);
            } else {
                console.error(`[FAIL] Could not locate the created prescription in patient prescription history.`);
            }
        } else {
            console.error(`[FAIL] Fetch prescriptions request failed:`, getRxData);
        }
    } catch (e: any) {
        console.error(`[FAIL] Fetch prescriptions request error:`, e.message);
    }

    // 7. Test Trie Autocomplete
    try {
        console.log("\nTesting Trie drug autocomplete endpoint...");
        const autocompleteRes = await fetch(`${API_BASE}/dsa/drug/autocomplete?q=as`);
        const autocompleteData = await autocompleteRes.json() as any;
        if (autocompleteRes.ok && autocompleteData.suggestions && autocompleteData.suggestions.length > 0) {
            console.log(`[PASS] Drug autocomplete returned: ${autocompleteData.suggestions.map((s: any) => s.name).join(', ')}`);
        } else {
            console.error(`[FAIL] Drug autocomplete failed:`, autocompleteData);
        }
    } catch (e: any) {
        console.error(`[FAIL] Drug autocomplete error:`, e.message);
    }

    // 8. Test HashMap Drug Interactions
    try {
        console.log("\nTesting HashMap drug interactions endpoint...");
        const interactRes = await fetch(`${API_BASE}/dsa/drug/interactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drugs: ['Aspirin', 'Warfarin'] })
        });
        const interactData = await interactRes.json() as any;
        if (interactRes.ok && interactData.count > 0) {
            console.log(`[PASS] HashMap drug interaction warning: Found ${interactData.count} interactions`);
        } else {
            console.error(`[FAIL] HashMap drug interaction failed:`, interactData);
        }
    } catch (e: any) {
        console.error(`[FAIL] HashMap drug interaction error:`, e.message);
    }

    // 9. Test DSA Stats
    try {
        console.log("\nTesting DSA stats endpoint...");
        const statsRes = await fetch(`${API_BASE}/dsa/stats`);
        const statsData = await statsRes.json() as any;
        if (statsRes.ok && Array.isArray(statsData.dataStructures)) {
            console.log(`[PASS] DSA stats retrieved successfully. Total structures: ${statsData.dataStructures.length}`);
        } else {
            console.error(`[FAIL] DSA stats failed:`, statsData);
        }
    } catch (e: any) {
        console.error(`[FAIL] DSA stats error:`, e.message);
    }

    console.log("\n=== HTTP API VERIFICATION COMPLETE ===");
    process.exit(0);
}

runHttpTests().catch(err => {
    console.error("HTTP verification execution error:", err);
    process.exit(1);
});
