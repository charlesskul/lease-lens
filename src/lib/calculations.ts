/**
 * Lease Lens — Financial Calculation Engine
 *
 * Pure functions with zero UI coupling.  All monetary values are in USD.
 * Discount rates are expressed as annual percentages (e.g. 5 for 5 %).
 */

import type { LeaseProposal, CashFlowMonth, ComparisonMetrics } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert an annual discount rate (percentage) to a monthly rate.
 *
 *   r_monthly = (1 + r_annual)^(1/12) − 1
 */
export function annualToMonthlyRate(annualPercent: number): number {
    if (annualPercent < 0) return 0;
    const annual = annualPercent / 100;
    return Math.pow(1 + annual, 1 / 12) - 1;
}

/**
 * Format a Date to a short label like "Mar 2026".
 */
function formatMonthLabel(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── Timeline / Cash-Flow Generation ─────────────────────────────────────────

/**
 * Build the month-by-month cash-flow array for a single lease proposal.
 *
 * Escalation logic:
 *   • Year 1 uses the base rent as-is.
 *   • Each subsequent year increases the PREVIOUS year's rent by the
 *     configured percentage or fixed dollar amount.
 *
 * Abatement: months 1 through `freeRentMonths` have $0 rent (NNN still due).
 *
 * TI Allowance: applied as a negative offset in Month 1 (upfront).
 */
export function generateTimeline(proposal: LeaseProposal): CashFlowMonth[] {
    const totalMonths = Math.max(1, Math.round(proposal.termYears * 12));
    const startDate = proposal.startDate
        ? new Date(proposal.startDate)
        : new Date();

    const cashFlows: CashFlowMonth[] = [];
    let cumulativeCashOut = 0;
    let currentAnnualRent = proposal.baseRentMonthly; // per-month figure

    for (let m = 1; m <= totalMonths; m++) {
        // Determine the lease year (1-indexed)
        const leaseYear = Math.ceil(m / 12);

        // Apply escalation at the boundary of each new lease year (month 13, 25, …)
        if (m > 1 && (m - 1) % 12 === 0) {
            switch (proposal.escalationType) {
                case "percentage":
                    currentAnnualRent *= 1 + proposal.escalationValue / 100;
                    break;
                case "fixed":
                    currentAnnualRent += proposal.escalationValue;
                    break;
                case "none":
                default:
                    break;
            }
        }

        const scheduledRent = currentAnnualRent;
        const isAbated = m <= proposal.freeRentMonths;
        const actualRent = isAbated ? 0 : scheduledRent;
        const nnn = proposal.nnnMonthly;
        const tiOffset = m === 1 ? proposal.tiAllowance : 0;

        const netCashOut = actualRent + nnn - tiOffset;
        cumulativeCashOut += netCashOut;

        // Calendar date for the label
        const monthDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth() + (m - 1),
            1
        );

        cashFlows.push({
            month: m,
            dateLabel: formatMonthLabel(monthDate),
            leaseYear,
            scheduledRent: round2(scheduledRent),
            nnn: round2(nnn),
            isAbated,
            actualRent: round2(actualRent),
            tiOffset: round2(tiOffset),
            netCashOut: round2(netCashOut),
            cumulativeCashOut: round2(cumulativeCashOut),
        });
    }

    return cashFlows;
}

// ─── NPV ─────────────────────────────────────────────────────────────────────

/**
 * Calculate the Net Present Value of a series of cash flows.
 *
 *   NPV = Σ  R_t / (1 + r)^t      for t = 1 … N
 *
 * Cash flows are discounted from Month 1 (not Month 0).
 */
export function calculateNPV(
    cashFlows: CashFlowMonth[],
    monthlyRate: number
): number {
    if (monthlyRate < 0) return cashFlows.reduce((s, c) => s + c.netCashOut, 0);

    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
        const t = i + 1; // periods start at 1
        npv += cashFlows[i].netCashOut / Math.pow(1 + monthlyRate, t);
    }
    return round2(npv);
}

// ─── Effective Monthly Rent (Annuity Conversion) ─────────────────────────────

/**
 * Convert an NPV into a flat monthly annuity payment.
 *
 *   PMT = NPV × r / (1 − (1 + r)^(−n))
 *
 * When r ≈ 0 falls back to simple division.
 */
export function calculateEffectiveMonthlyRent(
    npv: number,
    months: number,
    monthlyRate: number
): number {
    if (months <= 0) return 0;
    if (monthlyRate <= 1e-10) return round2(npv / months);

    const factor = 1 - Math.pow(1 + monthlyRate, -months);
    if (Math.abs(factor) < 1e-15) return round2(npv / months);

    return round2((npv * monthlyRate) / factor);
}

// ─── Full Metrics ────────────────────────────────────────────────────────────

/**
 * Compute complete comparison metrics for a single proposal.
 */
export function calculateMetrics(
    proposal: LeaseProposal,
    annualDiscountRate: number
): ComparisonMetrics {
    const cashFlows = generateTimeline(proposal);
    const totalMonths = cashFlows.length;
    const monthlyRate = annualToMonthlyRate(annualDiscountRate);

    const totalCashOut =
        totalMonths > 0 ? cashFlows[totalMonths - 1].cumulativeCashOut : 0;
    const averageMonthlyRent =
        totalMonths > 0 ? round2(totalCashOut / totalMonths) : 0;

    const npv = calculateNPV(cashFlows, monthlyRate);
    const effectiveMonthlyRent = calculateEffectiveMonthlyRent(
        npv,
        totalMonths,
        monthlyRate
    );

    return {
        proposalId: proposal.id,
        proposalName: proposal.name,
        totalCashOut,
        averageMonthlyRent,
        npv,
        effectiveMonthlyRent,
        totalMonths,
        cashFlows,
    };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Round to 2 decimal places (avoids floating-point dust). */
function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
