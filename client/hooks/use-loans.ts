"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

export type LoanSummary = {
    id: string;
    creditScore: number;
    amount: number; // in USDC minor units
    termMonths: number;
    aprBps: number; // 1200 => 12.00%
    collateralPct: number; // 5 => 5%
    fundedAmount: number; // minor units
    targetAmount: number; // minor units
};

export type PortfolioPosition = {
    loanId: string;
    amount: number; // minor units
    sharePct: number;
    state: "Open" | "Funded" | "Drawn" | "Repaid" | "Defaulted";
};

type FilterState = {
    termMonths?: number;
    minAprBps?: number;
    minScore?: number;
    setFilters: (partial: Partial<FilterState>) => void;
};

export const useLoanFiltersStore = create<FilterState>((set) => ({
    termMonths: undefined,
    minAprBps: undefined,
    minScore: undefined,
    setFilters: (partial) => set(partial),
}));

// Mock data source for now; replace with on-chain query wiring later
const mockLoans: LoanSummary[] = [
    {
        id: "1",
        creditScore: 780,
        amount: 5000_00,
        termMonths: 6,
        aprBps: 1240,
        collateralPct: 5,
        fundedAmount: 1200_00,
        targetAmount: 5000_00,
    },
    {
        id: "2",
        creditScore: 720,
        amount: 3000_00,
        termMonths: 3,
        aprBps: 1180,
        collateralPct: 8,
        fundedAmount: 2500_00,
        targetAmount: 3000_00,
    },
    {
        id: "3",
        creditScore: 800,
        amount: 7500_00,
        termMonths: 12,
        aprBps: 1320,
        collateralPct: 4,
        fundedAmount: 0,
        targetAmount: 7500_00,
    },
];

function applyFilters(loans: LoanSummary[], filters: FilterState): LoanSummary[] {
    return loans.filter((l) => {
        if (filters.termMonths && l.termMonths !== filters.termMonths) return false;
        if (filters.minAprBps && l.aprBps < filters.minAprBps) return false;
        if (filters.minScore && l.creditScore < filters.minScore) return false;
        return true;
    });
}

export function useLoansList() {
    const filters = useLoanFiltersStore();
    return useQuery({
        queryKey: ["loans", filters.termMonths, filters.minAprBps, filters.minScore],
        queryFn: async () => {
            // TODO: replace with program account fetch
            const data = mockLoans;
            return applyFilters(data, filters);
        },
    });
}

export function useLoanDetail(loanId?: string) {
    return useQuery({
        queryKey: ["loan", loanId],
        enabled: Boolean(loanId),
        queryFn: async () => {
            // TODO: replace with precise program account fetch
            const found = mockLoans.find((l) => l.id === loanId);
            if (!found) throw new Error("Loan not found");
            return found;
        },
    });
}

export function usePortfolio() {
    return useQuery({
        queryKey: ["portfolio"],
        queryFn: async (): Promise<PortfolioPosition[]> => {
            // TODO: replace with lender_share account scan by wallet
            return [];
        },
    });
}

// Mutations (wire to Anchor later)
export function useLenderFund() {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ["lender_fund"],
        mutationFn: async (args: { loanId: string; amount: number }) => {
            // TODO: call Anchor program.methods.lenderFund
            await new Promise((r) => setTimeout(r, 600));
            return args;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["loans"] });
            qc.invalidateQueries({ queryKey: ["loan"] });
            qc.invalidateQueries({ queryKey: ["portfolio"] });
        },
    });
}

export function useFinalizeFunding() {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ["finalize_funding"],
        mutationFn: async (args: { loanId: string }) => {
            // TODO: program.methods.finalizeFunding
            await new Promise((r) => setTimeout(r, 600));
            return args;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["loans"] });
            qc.invalidateQueries({ queryKey: ["loan"] });
        },
    });
}

export function usePayoutToLenders() {
    const qc = useQueryClient();
    return useMutation({
        mutationKey: ["payout_to_lenders"],
        mutationFn: async (args: { loanId: string }) => {
            // TODO: program.methods.payoutToLenders
            await new Promise((r) => setTimeout(r, 600));
            return args;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["portfolio"] });
        },
    });
}

export function formatCurrencyMinor(amountMinor: number) {
    return `$${(amountMinor / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function bpsToPct(aprBps: number) {
    return `${(aprBps / 100).toFixed(2)}%`;
}


