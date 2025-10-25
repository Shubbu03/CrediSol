"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { useLoansMarketplaceProgram, useScoreAttestorProgram } from "./use-get-program";
import { useConfigPda, useLoanPda, useLoanSignerPda, useLenderSharePda, TOKEN_PROGRAM_ID, SystemProgram } from "../lib/solana/program";
import { useScoreAttestationPda } from "../lib/solana/program";
import { BN } from '@coral-xyz/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { connection } from '../lib/solana/connection';
import { notify } from '../lib/notify';

export type LoanSummary = {
    id: string;
    borrower: string;
    loanId: string; // Changed from number to string to handle large BN values
    amount: number;
    termSecs: number;
    maxAprBps: number;
    minCollateralBps: number;
    fundingDeadline: number;
    state: number;
    fundedAmount: number;
    collateralAmount: number;
    actualAprBps: number;
    startTs: number;
    dueTs: number;
    lastAccrualTs: number;
    accruedInterest: number;
    outstandingPrincipal: number;
    totalRepaidPrincipal: number;
    totalRepaidInterest: number;
    // Computed fields for UI
    creditScore?: number;
    termMonths: number;
    aprBps: number;
    collateralPct: number;
    targetAmount: number;
};

export type PortfolioPosition = {
    loanId: string;
    principal: number;
    repaidPrincipal: number;
    repaidInterest: number;
    proRataBps: number;
    state: number;
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

function applyFilters(loans: LoanSummary[], filters: FilterState): LoanSummary[] {
    return loans.filter((l) => {
        // Term filter: check if loan term matches the selected term exactly
        if (filters.termMonths && l.termMonths !== filters.termMonths) return false;

        // APR filter: check if loan APR meets minimum requirement
        if (filters.minAprBps && l.aprBps < filters.minAprBps) return false;

        // Credit score filter: check if loan has minimum credit score
        if (filters.minScore && (l.creditScore ?? 0) < filters.minScore) return false;

        return true;
    });
}

export function useLoansList() {
    const program = useLoansMarketplaceProgram();
    const filters = useLoanFiltersStore();

    return useQuery({
        queryKey: ["loans", filters.termMonths, filters.minAprBps, filters.minScore],
        enabled: !!program, // Only run query when program is available
        queryFn: async () => {
            if (!program) {
                throw new Error("Program not available");
            }
            try {
                const loans = await (program.account as any).loanAccount.all();
                const mappedLoans: LoanSummary[] = loans.map((loan: any) => ({
                    id: loan.publicKey.toBase58(),
                    borrower: loan.account.borrower.toBase58(),
                    loanId: loan.account.loanId.toString(), // Convert to string to avoid 53-bit limit
                    amount: loan.account.amount.toNumber(),
                    termSecs: loan.account.termSecs.toNumber(),
                    maxAprBps: loan.account.maxAprBps,
                    minCollateralBps: loan.account.minCollateralBps,
                    fundingDeadline: loan.account.fundingDeadline.toNumber(),
                    state: loan.account.state,
                    fundedAmount: loan.account.fundedAmount.toNumber(),
                    collateralAmount: loan.account.collateralAmount.toNumber(),
                    actualAprBps: loan.account.actualAprBps,
                    startTs: loan.account.startTs.toNumber(),
                    dueTs: loan.account.dueTs.toNumber(),
                    lastAccrualTs: loan.account.lastAccrualTs.toNumber(),
                    accruedInterest: loan.account.accruedInterest.toNumber(),
                    outstandingPrincipal: loan.account.outstandingPrincipal.toNumber(),
                    totalRepaidPrincipal: loan.account.totalRepaidPrincipal.toNumber(),
                    totalRepaidInterest: loan.account.totalRepaidInterest.toNumber(),
                    // Computed fields for UI
                    creditScore: undefined, // Will be fetched separately via useCreditScore hook
                    termMonths: loan.account.termSecs.toNumber() / (30.44 * 24 * 60 * 60),
                    aprBps: loan.account.maxAprBps,
                    collateralPct: loan.account.minCollateralBps / 100,
                    targetAmount: loan.account.amount.toNumber(),
                }));

                // Sort by creation time (most recent first) and apply filters
                const sortedLoans = mappedLoans.sort((a, b) => b.startTs - a.startTs);
                const filteredLoans = applyFilters(sortedLoans, filters);

                return filteredLoans;
            } catch (error) {
                console.error("Failed to fetch loans:", error);
                return [];
            }
        },
    });
}

export function useRecentLoansList() {
    const program = useLoansMarketplaceProgram();
    const filters = useLoanFiltersStore();

    return useQuery({
        queryKey: ["recent-loans", filters.termMonths, filters.minAprBps, filters.minScore],
        enabled: !!program,
        queryFn: async () => {
            if (!program) {
                throw new Error("Program not available");
            }
            try {
                const loans = await (program.account as any).loanAccount.all();
                const mappedLoans: LoanSummary[] = loans.map((loan: any) => ({
                    id: loan.publicKey.toBase58(),
                    borrower: loan.account.borrower.toBase58(),
                    loanId: loan.account.loanId.toString(),
                    amount: loan.account.amount.toNumber(),
                    termSecs: loan.account.termSecs.toNumber(),
                    maxAprBps: loan.account.maxAprBps,
                    minCollateralBps: loan.account.minCollateralBps,
                    fundingDeadline: loan.account.fundingDeadline.toNumber(),
                    state: loan.account.state,
                    fundedAmount: loan.account.fundedAmount.toNumber(),
                    collateralAmount: loan.account.collateralAmount.toNumber(),
                    actualAprBps: loan.account.actualAprBps,
                    startTs: loan.account.startTs.toNumber(),
                    dueTs: loan.account.dueTs.toNumber(),
                    lastAccrualTs: loan.account.lastAccrualTs.toNumber(),
                    accruedInterest: loan.account.accruedInterest.toNumber(),
                    outstandingPrincipal: loan.account.outstandingPrincipal.toNumber(),
                    totalRepaidPrincipal: loan.account.totalRepaidPrincipal.toNumber(),
                    totalRepaidInterest: loan.account.totalRepaidInterest.toNumber(),
                    // Computed fields for UI
                    creditScore: undefined,
                    termMonths: Math.round(loan.account.termSecs.toNumber() / (30 * 24 * 60 * 60) * 10) / 10, // Round to 1 decimal place
                    aprBps: loan.account.maxAprBps,
                    collateralPct: loan.account.minCollateralBps / 100,
                    targetAmount: loan.account.amount.toNumber(),
                }));

                // Sort by creation time (most recent first), apply filters, then limit to 3
                const sortedLoans = mappedLoans.sort((a, b) => b.startTs - a.startTs);
                const filteredLoans = applyFilters(sortedLoans, filters);

                return filteredLoans.slice(0, 3); // Return only 3 most recent
            } catch (error) {
                console.error("Failed to fetch recent loans:", error);
                return [];
            }
        },
    });
}

export function useLoanDetail(loanId?: string) {
    const program = useLoansMarketplaceProgram();

    return useQuery({
        queryKey: ["loan", loanId],
        enabled: Boolean(loanId) && !!program,
        queryFn: async () => {
            if (!program) {
                throw new Error("Program not available");
            }
            try {
                const loanPda = new PublicKey(loanId!);
                const loan = await (program.account as any).loanAccount.fetch(loanPda);
                return {
                    id: loanPda.toBase58(),
                    borrower: loan.borrower.toBase58(),
                    loanId: loan.loanId.toString(), // Convert to string to avoid 53-bit limit
                    amount: loan.amount.toNumber(),
                    termSecs: loan.termSecs.toNumber(),
                    maxAprBps: loan.maxAprBps,
                    minCollateralBps: loan.minCollateralBps,
                    fundingDeadline: loan.fundingDeadline.toNumber(),
                    state: loan.state,
                    fundedAmount: loan.fundedAmount.toNumber(),
                    collateralAmount: loan.collateralAmount.toNumber(),
                    actualAprBps: loan.actualAprBps,
                    startTs: loan.startTs.toNumber(),
                    dueTs: loan.dueTs.toNumber(),
                    lastAccrualTs: loan.lastAccrualTs.toNumber(),
                    accruedInterest: loan.accruedInterest.toNumber(),
                    outstandingPrincipal: loan.outstandingPrincipal.toNumber(),
                    totalRepaidPrincipal: loan.totalRepaidPrincipal.toNumber(),
                    totalRepaidInterest: loan.totalRepaidInterest.toNumber(),
                    // Computed fields for UI
                    creditScore: undefined, // Will be fetched separately via useCreditScore hook
                    termMonths: Math.round(loan.termSecs.toNumber() / (30 * 24 * 60 * 60) * 10) / 10, // Round to 1 decimal place
                    aprBps: loan.maxAprBps,
                    collateralPct: loan.minCollateralBps / 100,
                    targetAmount: loan.amount.toNumber(),
                } as LoanSummary;
            } catch (error) {
                console.error("Failed to fetch loan detail:", error);
                throw new Error("Loan not found");
            }
        },
    });
}

export function usePortfolio() {
    const program = useLoansMarketplaceProgram();
    const { publicKey } = useWallet();

    return useQuery({
        queryKey: ["portfolio", publicKey?.toBase58()],
        enabled: !!program && !!publicKey,
        queryFn: async (): Promise<PortfolioPosition[]> => {
            if (!program) {
                throw new Error("Program not available");
            }
            try {
                const lenderShares = await (program.account as any).lenderShare.all([
                    {
                        memcmp: {
                            offset: 8 + 32, // Skip discriminator + loan PDA
                            bytes: publicKey!.toBase58(),
                        },
                    },
                ]);

                return lenderShares.map((share: any) => ({
                    loanId: share.account.loan.toBase58(),
                    principal: share.account.principal.toNumber(),
                    repaidPrincipal: share.account.repaidPrincipal.toNumber(),
                    repaidInterest: share.account.repaidInterest.toNumber(),
                    proRataBps: share.account.proRataBps,
                    state: 0, // Will need to fetch loan state separately
                }));
            } catch (error) {
                console.error("Failed to fetch portfolio:", error);
                return [];
            }
        },
    });
}

export function getLoanState(state: number): string {
    switch (state) {
        case 0: return "Created";
        case 1: return "Funding";
        case 2: return "Funded";
        case 3: return "Drawn";
        case 4: return "InRepayment";
        case 5: return "Delinquent";
        case 6: return "Defaulted";
        case 7: return "Settled";
        default: return "Unknown";
    }
}

// Credit Score Hook
export function useCreditScore(borrower: string, loanId: string) {
    const scoreProgram = useScoreAttestorProgram();

    return useQuery({
        queryKey: ["creditScore", borrower, loanId],
        enabled: !!scoreProgram && !!borrower && !!loanId && borrower.length > 0 && loanId.length > 0,
        queryFn: async () => {
            if (!scoreProgram) {
                throw new Error("Score program not available");
            }

            // Validate inputs
            if (!borrower || !loanId || borrower.length === 0 || loanId.length === 0) {
                throw new Error("Invalid borrower or loan ID");
            }

            try {
                const borrowerPubkey = new PublicKey(borrower);
                const loanPubkey = new PublicKey(loanId);
                const scoreAttestationPda = useScoreAttestationPda(borrowerPubkey, loanPubkey);

                const scoreAttestation = await (scoreProgram.account as any).scoreAttestation.fetch(scoreAttestationPda);
                return {
                    score: scoreAttestation.score,
                    grade: scoreAttestation.grade,
                    pdBps: scoreAttestation.pdBps,
                    recommendedMinCollateralBps: scoreAttestation.recommendedMinCollateralBps,
                };
            } catch (error) {
                console.error("Failed to fetch credit score:", error);
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false, // Don't retry on error
    });
}

// Mutations
export function useLenderFund() {
    const program = useLoansMarketplaceProgram();
    const { publicKey } = useWallet();
    const configPda = useConfigPda();
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ["lender_fund"],
        mutationFn: async ({ loanId, amount }: { loanId: string; amount: number }) => {
            if (!publicKey) throw new Error("Wallet not connected");
            if (!program) throw new Error("Program not available");

            try {
                notify({ description: "Processing funding transaction...", type: "info" });

                const loanPda = new PublicKey(loanId);

                // Fetch the loan account to get borrower and loan ID
                const loanAccount = await (program.account as any).loan.fetch(loanPda);
                const borrower = loanAccount.borrower;
                const actualLoanId = loanAccount.loanId.toString();

                const loanSignerPda = useLoanSignerPda(borrower, actualLoanId);
                const lenderSharePda = useLenderSharePda(loanPda, publicKey);

                // Get USDC mint from config
                const config = await (program.account as any).config.fetch(configPda);
                const usdcMint = config.usdcMint;

                const lenderAta = await getAssociatedTokenAddress(usdcMint, publicKey);
                const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);

                // Check if lender ATA exists, create if not
                const lenderAtaInfo = await connection.getAccountInfo(lenderAta);
                const loanEscrowAtaInfo = await connection.getAccountInfo(loanEscrowAta);
                const instructions: TransactionInstruction[] = [];

                if (!lenderAtaInfo) {
                    instructions.push(
                        createAssociatedTokenAccountInstruction(
                            publicKey, // payer
                            lenderAta, // ata
                            publicKey, // owner
                            usdcMint // mint
                        )
                    );
                }

                if (!loanEscrowAtaInfo) {
                    instructions.push(
                        createAssociatedTokenAccountInstruction(
                            publicKey, // payer
                            loanEscrowAta, // ata
                            loanSignerPda, // owner (the loan signer PDA)
                            usdcMint // mint
                        )
                    );
                }

                const tx = await program.methods
                    .lenderFund(new BN(amount))
                    .accountsStrict({
                        config: configPda,
                        lender: publicKey,
                        loan: loanPda,
                        loanSigner: loanSignerPda,
                        lenderAta,
                        loanEscrowAta,
                        lenderShare: lenderSharePda,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    })
                    .preInstructions(instructions)
                    .rpc();

                notify({ description: "Successfully funded loan!", type: "success" });
                return tx;
            } catch (error) {
                notify({ description: `Failed to fund loan: ${error}`, type: "error" });
                throw error;
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["loans"] });
            qc.invalidateQueries({ queryKey: ["loan"] });
            qc.invalidateQueries({ queryKey: ["portfolio"] });
        },
    });
}

export function useFinalizeFunding() {
    const program = useLoansMarketplaceProgram();
    const { publicKey } = useWallet();
    const configPda = useConfigPda();
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ["finalize_funding"],
        mutationFn: async ({ loanId }: { loanId: string }) => {
            if (!publicKey) throw new Error("Wallet not connected");
            if (!program) throw new Error("Program not available");

            try {
                notify({ description: "Processing finalize funding transaction...", type: "info" });

                const loanPda = new PublicKey(loanId);
                const loanSignerPda = useLoanSignerPda(publicKey, 0); // TODO: Extract loan ID from loanPda

                const tx = await program.methods
                    .finalizeFunding()
                    .accountsStrict({
                        loan: loanPda,
                        borrower: publicKey,
                    })
                    .rpc();

                notify({ description: "Successfully finalized funding!", type: "success" });
                return tx;
            } catch (error) {
                notify({ description: `Failed to finalize funding: ${error}`, type: "error" });
                throw error;
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["loans"] });
            qc.invalidateQueries({ queryKey: ["loan"] });
        },
    });
}

export function usePayoutToLenders() {
    const program = useLoansMarketplaceProgram();
    const { publicKey } = useWallet();
    const configPda = useConfigPda();
    const qc = useQueryClient();

    return useMutation({
        mutationKey: ["payout_to_lenders"],
        mutationFn: async ({ loanId }: { loanId: string }) => {
            if (!publicKey) throw new Error("Wallet not connected");
            if (!program) throw new Error("Program not available");

            try {
                notify({ description: "Processing payout transaction...", type: "info" });

                const loanPda = new PublicKey(loanId);
                const loanSignerPda = useLoanSignerPda(publicKey, 0); // TODO: Extract loan ID from loanPda
                const lenderSharePda = useLenderSharePda(loanPda, publicKey);

                // Get USDC mint from config
                const config = await (program.account as any).config.fetch(configPda);
                const usdcMint = config.usdcMint;

                const lenderAta = await getAssociatedTokenAddress(usdcMint, publicKey);
                const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);

                const tx = await program.methods
                    .payoutToLenders()
                    .accountsStrict({
                        lender: publicKey,
                        loan: loanPda,
                        lenderAta,
                        lenderShare: lenderSharePda,
                        usdcMint,
                        systemProgram: SystemProgram.programId,
                        collateralEscrowAta: loanEscrowAta,
                        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
                        tokenProgram: TOKEN_PROGRAM_ID,
                    })
                    .rpc();

                notify({ description: "Successfully processed payout!", type: "success" });
                return tx;
            } catch (error) {
                notify({ description: `Failed to process payout: ${error}`, type: "error" });
                throw error;
            }
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


