"use client";

import { motion } from "framer-motion";
import { bpsToPct, formatCurrencyMinor, LoanSummary } from "../../hooks/use-loans";
import Link from "next/link";

export function LoanCard({ loan }: { loan: LoanSummary }) {
    const progress = Math.min(100, Math.round((loan.fundedAmount / loan.targetAmount) * 100));

    return (
        <motion.div
            className="p-6 bg-surface-1 rounded-xl border border-border/30 hover:border-trust-green/30 transition-colors"
            whileHover={{ scale: 1.02, y: -2 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-foreground/70">
                    Credit Score: {loan.creditScore !== undefined ? loan.creditScore : "N/A"}
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-trust-green/10 text-trust-green">
                    {bpsToPct(loan.aprBps)} APR
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <Row label="Amount" value={formatCurrencyMinor(loan.amount)} />
                <Row label="Term" value={`${loan.termMonths} months`} />
                <Row label="Collateral" value={`${loan.collateralPct}%`} />
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
