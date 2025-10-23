"use client";

import { motion } from "framer-motion";
import { bpsToPct, formatCurrencyMinor, LoanSummary } from "../../hooks/use-loans";
import Link from "next/link";
import { CheckCircle2, Shield, AlertTriangle } from "lucide-react";

export function LoanCard({ loan }: { loan: LoanSummary }) {
    const progress = Math.min(100, Math.round((loan.fundedAmount / loan.targetAmount) * 100));

    return (
        <motion.div
            className="p-6 bg-surface-1 rounded-xl border border-border/30 hover:border-trust-green/30 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-foreground/70">
                        Credit Score: {loan.creditScore || '--'}
                    </div>
                    {loan.creditScoreAttested ? (
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">Verified</span>
                        </div>
                    ) : loan.creditScore ? (
                        <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-yellow-400 font-medium">Unverified</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400 font-medium">No Score</span>
                        </div>
                    )}
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-trust-green/10 text-trust-green">
                    {bpsToPct(loan.aprBps)} APR
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <Row label="Amount" value={formatCurrencyMinor(loan.amount)} />
                <Row label="Term" value={`${loan.termMonths} months`} />
                <Row label="Collateral" value={`${loan.collateralPct}%`} />
                {loan.creditScoreAttested && loan.creditScoreGrade && (
                    <Row label="Grade" value={`${loan.creditScoreGrade}/5`} />
                )}
                {loan.creditScoreAttested && loan.creditScoreExpiry && (
                    <Row
                        label="Score Expires"
                        value={new Date(loan.creditScoreExpiry * 1000).toLocaleDateString()}
                    />
                )}
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-1 text-xs text-foreground/60">
                    <span>Funding</span>
                    <span>
                        {formatCurrencyMinor(loan.fundedAmount)} / {formatCurrencyMinor(loan.targetAmount)} ({progress}%)
                    </span>
                </div>
                <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-trust-green to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 80, damping: 20 }}
                    />
                </div>
            </div>

            <Link href={`/dashboard/lend/${loan.id}`}>
                <motion.button
                    className="w-full py-2 bg-gradient-to-r from-trust-green to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-trust-green/30 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    View & Fund
                </motion.button>
            </Link>
        </motion.div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-sm text-foreground/70">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}
