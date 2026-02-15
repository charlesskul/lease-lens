/**
 * Zustand store for managing lease proposals and global settings.
 */

import { create } from "zustand";
import type { LeaseProposal, CurrencyCode } from "@/lib/types";

// ─── Default Proposals ───────────────────────────────────────────────────────

/** Deterministic IDs for the initial proposals (avoids SSR/client hydration mismatch). */
const DEFAULT_IDS = [
    "default-proposal-a",
    "default-proposal-b",
    "default-proposal-c",
    "default-proposal-d",
];

const PROPOSAL_NAMES = ["Proposal A", "Proposal B", "Proposal C", "Proposal D"];

function createDefaultProposal(index: number, isDynamic = false): LeaseProposal {
    return {
        id: isDynamic ? crypto.randomUUID() : DEFAULT_IDS[index],
        name: PROPOSAL_NAMES[index] ?? `Proposal ${index + 1}`,
        termYears: 5,
        startDate: "2026-02-15",
        baseRentMonthly: 5000,
        escalationType: "none",
        escalationValue: 0,
        freeRentMonths: 0,
        tiAllowance: 0,
        squareFootage: 1000,
        nnnMonthly: 0,
    };
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface LeaseStore {
    proposals: LeaseProposal[];
    discountRate: number; // Annual %, e.g. 5
    currency: CurrencyCode;

    addProposal: () => void;
    removeProposal: (id: string) => void;
    updateProposal: (id: string, data: Partial<LeaseProposal>) => void;
    setDiscountRate: (rate: number) => void;
    setCurrency: (currency: CurrencyCode) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useLeaseStore = create<LeaseStore>((set) => ({
    proposals: [createDefaultProposal(0), createDefaultProposal(1)],
    discountRate: 5,
    currency: "USD" as CurrencyCode,

    addProposal: () =>
        set((state) => {
            if (state.proposals.length >= 4) return state;
            return {
                proposals: [
                    ...state.proposals,
                    createDefaultProposal(state.proposals.length, true),
                ],
            };
        }),

    removeProposal: (id: string) =>
        set((state) => {
            if (state.proposals.length <= 1) return state;
            return {
                proposals: state.proposals.filter((p) => p.id !== id),
            };
        }),

    updateProposal: (id: string, data: Partial<LeaseProposal>) =>
        set((state) => ({
            proposals: state.proposals.map((p) =>
                p.id === id ? { ...p, ...data } : p
            ),
        })),

    setDiscountRate: (rate: number) =>
        set({ discountRate: Math.max(0, Math.min(20, rate)) }),

    setCurrency: (currency: CurrencyCode) =>
        set({ currency }),
}));
