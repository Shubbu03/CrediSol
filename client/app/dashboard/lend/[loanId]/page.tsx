"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useLoanDetail, useLenderFund, useCreditScore, bpsToPct, formatCurrencyMinor } from "../../../../hooks/use-loans";
import { useState } from "react";

export default function LoanDetailPage() {
    const params = useParams<{ loanId: string }>();
    const loanId = params?.loanId;
    const { connected } = useWallet();
    const router = useRouter();
    const { data: loan, isLoading } = useLoanDetail(loanId);
    const { data: creditScore } = useCreditScore(loan?.borrower || "", loanId || "");
    const fund = useLenderFund();
    const [amount, setAmount] = useState<string>("");

    const progress = loan ? Math.min(100, Math.round((loan.fundedAmount / loan.targetAmount) * 100)) : 0;

    if (!connected) {
        return (
            <div className="min-h-screen bg-background">
                <div className="pt-24 max-w-xl mx-auto px-4">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">Connect your wallet</h1>
                        <p className="text-foreground/70">Please connect your Solana wallet to fund this loan.</p>
                    </div>
                    <div className="flex justify-center">
                        <WalletMultiButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                <button
                    className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-6 transition-colors"
                    onClick={() => router.back()}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>

                {isLoading || !loan ? (
                    <div className="p-6 bg-surface-1 rounded-xl border border-border/30">Loading...</div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-surface-1 rounded-xl border border-border/30">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Loan #{loan.id}</h1>
                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-trust-green/10 text-trust-green">
                                {bpsToPct(loan.aprBps)} APR
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <Stat label="Credit Score" value={creditScore?.score?.toString() || "N/A"} />
                            <Stat label="Amount" value={formatCurrencyMinor(loan.amount)} />
                            <Stat label="Term" value={`${loan.termMonths.toFixed(1)} mo`} />
                            <Stat label="Collateral" value={`${loan.collateralPct.toFixed(1)}%`} />
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2 text-sm text-foreground/70">
                                <span>Funding Progress</span>
                                <span>
                                    {formatCurrencyMinor(loan.fundedAmount)} / {formatCurrencyMinor(loan.targetAmount)} ({progress}%)
                                </span>
                            </div>
                            <div className="h-3 w-full bg-border/40 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-trust-green to-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                                />
                            </div>
                        </div>

                        <form
                            className="flex flex-col sm:flex-row gap-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const minor = Math.round(Number(amount || 0) * 100);
                                if (!minor || !loanId) return;
                                fund.mutate({ loanId, amount: minor });
                            }}
                        >
                            <input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount in USD"
                                className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-trust-green/40"
                                inputMode="decimal"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={fund.isPending}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-trust-green to-emerald-500 text-white font-medium disabled:opacity-60"
                            >
                                {fund.isPending ? "Funding..." : "Fund Loan"}
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 rounded-lg bg-background border border-border/30">
            <div className="text-xs text-foreground/60">{label}</div>
            <div className="font-semibold">{value}</div>
        </div>
    );
}
