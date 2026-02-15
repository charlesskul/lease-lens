// ─── Lease Proposal Input ────────────────────────────────────────────────────

export type EscalationType = "percentage" | "fixed" | "none";

export interface LeaseProposal {
    /** Unique identifier for the proposal */
    id: string;
    /** Human-readable name, e.g. "Main Street Location" */
    name: string;
    /** Lease term in years (e.g. 5) */
    termYears: number;
    /** ISO date string for lease commencement */
    startDate: string;
    /** Monthly base rent in USD */
    baseRentMonthly: number;
    /** Type of annual rent escalation */
    escalationType: EscalationType;
    /** Escalation value — percentage (e.g. 3 for 3%) or fixed dollar amount */
    escalationValue: number;
    /** Number of free-rent months at the start of the lease */
    freeRentMonths: number;
    /** Lump-sum tenant improvement allowance (deduction) in USD */
    tiAllowance: number;
    /** Square footage (optional, used for $/sqft display) */
    squareFootage: number;
    /** Monthly NNN / OpEx charges in USD */
    nnnMonthly: number;
}

// ─── Per-Month Cash Flow Record ──────────────────────────────────────────────

export interface CashFlowMonth {
    /** 1-indexed month number */
    month: number;
    /** Calendar date label (e.g. "Mar 2026") */
    dateLabel: string;
    /** Year of the lease (1-indexed) */
    leaseYear: number;
    /** Scheduled base rent before abatements */
    scheduledRent: number;
    /** NNN / OpEx for this month */
    nnn: number;
    /** Whether this month is an abated (free rent) month */
    isAbated: boolean;
    /** Actual rent paid after abatement */
    actualRent: number;
    /** TI allowance offset applied this month (Month 1 only for upfront) */
    tiOffset: number;
    /** Net cash out = actualRent + nnn - tiOffset */
    netCashOut: number;
    /** Running cumulative cash out */
    cumulativeCashOut: number;
}

// ─── Currency Configuration ──────────────────────────────────────────────────

export type CurrencyCode = "USD" | "PHP";

export interface CurrencyConfig {
    code: CurrencyCode;
    symbol: string;
    locale: string;
    name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
    USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
    PHP: { code: "PHP", symbol: "₱", locale: "en-PH", name: "Philippine Peso" },
};

// ─── Comparison Metrics ──────────────────────────────────────────────────────

export interface ComparisonMetrics {
    /** Reference back to the proposal ID */
    proposalId: string;
    /** Proposal display name */
    proposalName: string;
    /** Total undiscounted cash outlay over the lease */
    totalCashOut: number;
    /** Simple average monthly cost (totalCashOut / months) */
    averageMonthlyRent: number;
    /** Net Present Value of all cash flows */
    npv: number;
    /** Flat monthly annuity equivalent of the NPV */
    effectiveMonthlyRent: number;
    /** Total number of months */
    totalMonths: number;
    /** Complete month-by-month cash flow schedule */
    cashFlows: CashFlowMonth[];
}
