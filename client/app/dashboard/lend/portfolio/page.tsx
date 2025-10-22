"use client";

import { usePortfolio, getLoanState } from "../../../../hooks/use-loans";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PortfolioLoader, NoPortfolioEmptyState } from "../../../../components/shared/loader";
import { AuthGuard } from "../../../../components/shared/auth-guard";
import { BackButton } from "../../../../components/shared/back-button";

export default function PortfolioPage() {
    const { data: positions, isLoading } = usePortfolio();

    return (
        <AuthGuard requiredRole="lender">
            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                    <BackButton />
                    <h1 className="text-2xl font-bold mb-4">Your Portfolio</h1>
                    <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                        {isLoading ? (
                            <PortfolioLoader />
                        ) : !positions || positions.length === 0 ? (
                            <NoPortfolioEmptyState />
                        ) : (
                            <div className="space-y-3">
                                {positions.map((p) => (
                                    <motion.div key={p.loanId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/30">
                                        <div className="text-sm">Loan #{p.loanId.slice(0, 8)}...</div>
                                        <div className="text-sm text-foreground/70">{getLoanState(p.state)}</div>
                                        <div className="text-sm font-medium">{(p.principal / 100).toFixed(2)} USDC</div>
                                        <div className="text-xs text-foreground/60">{(p.proRataBps / 100).toFixed(2)}%</div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
