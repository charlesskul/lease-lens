/**
 * Verification script for the Lease Lens math engine.
 *
 * Run with:  npx tsx src/lib/__tests__/calculations.test.ts
 */

import {
    annualToMonthlyRate,
    generateTimeline,
    calculateNPV,
    calculateEffectiveMonthlyRent,
    calculateMetrics,
} from "../calculations";
import type { LeaseProposal } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assertClose(
    label: string,
    actual: number,
    expected: number,
    tolerance = 0.02
) {
    const diff = Math.abs(actual - expected);
    if (diff <= tolerance) {
        console.log(`  ✅ ${label}: ${actual} (expected ≈ ${expected})`);
        passed++;
    } else {
        console.error(
            `  ❌ ${label}: ${actual} (expected ≈ ${expected}, diff ${diff})`
        );
        failed++;
    }
}

function assertEqual(label: string, actual: unknown, expected: unknown) {
    if (actual === expected) {
        console.log(`  ✅ ${label}: ${String(actual)}`);
        passed++;
    } else {
        console.error(
            `  ❌ ${label}: ${String(actual)} (expected ${String(expected)})`
        );
        failed++;
    }
}

// ─── Test 1: Monthly Discount Rate ──────────────────────────────────────────

console.log("\n🔬 Test 1: Annual → Monthly Rate Conversion");
{
    // 5% annual → ~0.4074% monthly
    const r = annualToMonthlyRate(5);
    assertClose("5% annual → monthly", r, 0.004074, 0.0001);

    // 0% annual → 0 monthly
    assertClose("0% annual → monthly", annualToMonthlyRate(0), 0, 0.0001);

    // 12% annual → ~0.9489% monthly
    assertClose("12% annual → monthly", annualToMonthlyRate(12), 0.009489, 0.0001);
}

// ─── Test 2: Simple Flat Lease (No Escalation, No Abatement) ────────────────

console.log("\n🔬 Test 2: Simple 5-Year Flat Lease");
{
    const proposal: LeaseProposal = {
        id: "test-1",
        name: "Flat Lease",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 0,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const flows = generateTimeline(proposal);
    assertEqual("Total months", flows.length, 60);
    assertClose("Month 1 rent", flows[0].actualRent, 5000);
    assertClose("Month 60 rent", flows[59].actualRent, 5000);
    assertClose("Total cash out", flows[59].cumulativeCashOut, 300000);
    assertEqual("Month 1 abated", flows[0].isAbated, false);
}

// ─── Test 3: Lease with 3% Annual Escalation ────────────────────────────────

console.log("\n🔬 Test 3: 5-Year Lease with 3% Escalation");
{
    const proposal: LeaseProposal = {
        id: "test-2",
        name: "Escalating Lease",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "percentage",
        escalationValue: 3,
        freeRentMonths: 0,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const flows = generateTimeline(proposal);

    // Year 1: $5,000/mo
    assertClose("Year 1 rent", flows[0].actualRent, 5000);
    // Year 2: $5,000 × 1.03 = $5,150/mo
    assertClose("Year 2 rent (Month 13)", flows[12].actualRent, 5150);
    // Year 3: $5,150 × 1.03 = $5,304.50/mo
    assertClose("Year 3 rent (Month 25)", flows[24].actualRent, 5304.50);
    // Year 4: $5,304.50 × 1.03 = $5,463.64
    assertClose("Year 4 rent (Month 37)", flows[36].actualRent, 5463.64, 0.1);
    // Year 5: $5,463.64 × 1.03 = $5,627.54
    assertClose("Year 5 rent (Month 49)", flows[48].actualRent, 5627.55, 0.1);
}

// ─── Test 4: Abatement (Free Rent) ──────────────────────────────────────────

console.log("\n🔬 Test 4: Lease with 6-Month Free Rent");
{
    const proposal: LeaseProposal = {
        id: "test-3",
        name: "Abated Lease",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 6,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const flows = generateTimeline(proposal);
    assertEqual("Month 1 abated", flows[0].isAbated, true);
    assertClose("Month 1 actual rent", flows[0].actualRent, 0);
    assertEqual("Month 6 abated", flows[5].isAbated, true);
    assertClose("Month 6 actual rent", flows[5].actualRent, 0);
    assertEqual("Month 7 abated", flows[6].isAbated, false);
    assertClose("Month 7 actual rent", flows[6].actualRent, 5000);

    // Total = 54 months × $5,000 = $270,000
    assertClose("Total cash out", flows[59].cumulativeCashOut, 270000);
}

// ─── Test 5: TI Allowance ───────────────────────────────────────────────────

console.log("\n🔬 Test 5: Lease with $50,000 TI Allowance");
{
    const proposal: LeaseProposal = {
        id: "test-4",
        name: "TI Lease",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 0,
        tiAllowance: 50000,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const flows = generateTimeline(proposal);
    // Month 1: $5,000 - $50,000 = -$45,000
    assertClose("Month 1 net cash out", flows[0].netCashOut, -45000);
    assertClose("Month 1 TI offset", flows[0].tiOffset, 50000);
    // Month 2: $5,000 (no TI)
    assertClose("Month 2 net cash out", flows[1].netCashOut, 5000);
    // Total: (60 × $5,000) - $50,000 = $250,000
    assertClose("Total cash out", flows[59].cumulativeCashOut, 250000);
}

// ─── Test 6: NPV Calculation ────────────────────────────────────────────────

console.log("\n🔬 Test 6: NPV of Flat $5,000/mo Lease at 5% Discount");
{
    const proposal: LeaseProposal = {
        id: "test-5",
        name: "NPV Test",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 0,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const flows = generateTimeline(proposal);
    const r = annualToMonthlyRate(5);
    const npv = calculateNPV(flows, r);

    // Annuity PV = PMT × [(1 - (1+r)^-n) / r]
    // = 5000 × [(1 - 1.004074^-60) / 0.004074]
    // ≈ 5000 × 53.1338 ≈ 265,669
    assertClose("NPV (5% discount, flat lease)", npv, 265669, 5);
}

// ─── Test 7: Effective Monthly Rent ─────────────────────────────────────────

console.log("\n🔬 Test 7: Effective Monthly Rent (Round-trip Annuity)");
{
    const proposal: LeaseProposal = {
        id: "test-6",
        name: "EMR Test",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 0,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const flows = generateTimeline(proposal);
    const r = annualToMonthlyRate(5);
    const npv = calculateNPV(flows, r);
    const emr = calculateEffectiveMonthlyRent(npv, 60, r);

    // For a flat lease, effective monthly rent should equal base rent
    assertClose("EMR ≈ base rent (flat lease)", emr, 5000, 1);
}

// ─── Test 8: Full Metrics with Abatement ────────────────────────────────────

console.log("\n🔬 Test 8: Full Metrics — Abated Lease vs Flat Lease");
{
    const abatedProposal: LeaseProposal = {
        id: "test-7a",
        name: "Abated",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 6,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const flatProposal: LeaseProposal = {
        id: "test-7b",
        name: "Flat",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 0,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };

    const abatedMetrics = calculateMetrics(abatedProposal, 5);
    const flatMetrics = calculateMetrics(flatProposal, 5);

    console.log(`  Abated: NPV=${abatedMetrics.npv}, EMR=${abatedMetrics.effectiveMonthlyRent}`);
    console.log(`  Flat:   NPV=${flatMetrics.npv}, EMR=${flatMetrics.effectiveMonthlyRent}`);

    // Abated lease should have LOWER NPV (less cost to tenant)
    assertEqual(
        "Abated NPV < Flat NPV",
        abatedMetrics.npv < flatMetrics.npv,
        true
    );

    // Abated effective monthly rent should be lower
    assertEqual(
        "Abated EMR < Flat EMR",
        abatedMetrics.effectiveMonthlyRent < flatMetrics.effectiveMonthlyRent,
        true
    );
}

// ─── Test 9: NNN Charges ────────────────────────────────────────────────────

console.log("\n🔬 Test 9: NNN Operating Expenses");
{
    const proposal: LeaseProposal = {
        id: "test-8",
        name: "NNN Lease",
        termYears: 5,
        startDate: "2026-01-01",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 3,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 800,
    };

    const flows = generateTimeline(proposal);

    // Month 1 (abated): $0 rent + $800 NNN = $800
    assertClose("Month 1 net (abated + NNN)", flows[0].netCashOut, 800);
    // Month 4 (not abated): $5,000 + $800 = $5,800
    assertClose("Month 4 net (rent + NNN)", flows[3].netCashOut, 5800);
    // Total: 3×800 + 57×5800 = 2400 + 330600 = 333000
    assertClose("Total cash out", flows[59].cumulativeCashOut, 333000);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

if (failed > 0) process.exit(1);
