"use client";

import { usePortfolio, getLoanState, bpsToPct, formatCurrencyMinor } from "../../../../hooks/use-loans";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PortfolioLoader, NoPortfolioEmptyState } from "../../../../components/shared/loader";
import { AuthGuard } from "../../../../components/shared/auth-guard";
import { BackButton } from "../../../../components/shared/back-button";
import { Copy, Clock, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { notify } from "../../../../lib/notify";

export default function PortfolioPage() {
    const { data: positions, isLoading } = usePortfolio();
    const router = useRouter();

    const handleCopyLoanId = (loanId: string) => {
        navigator.clipboard.writeText(loanId);
        notify({
            type: "success",
            title: "Copied",
            description: "Loan ID copied to clipboard"
        });
    };

    const getStatusConfig = (state: number) => {
        switch (state) {
            case 2:
            case 3:
            case 4:
                return {
                    label: getLoanState(state),
                    className: "bg-green-500/10 text-green-500 border-green-500/20",
                    icon: <CheckCircle className="w-4 h-4" />
                };
            case 5:
            case 6:
                return {
                    label: getLoanState(state),
                    className: "bg-red-500/10 text-red-500 border-red-500/20",
                    icon: <AlertCircle className="w-4 h-4" />
                };
            default:
                return {
                    label: getLoanState(state),
                    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                    icon: <Clock className="w-4 h-4" />
                };
        }
    };

    const totalInvested = positions?.reduce((sum, p) => sum + p.principal, 0) || 0;
    const totalReturns = positions?.reduce((sum, p) => sum + p.repaidInterest, 0) || 0;
    const totalRepaid = positions?.reduce((sum, p) => sum + p.repaidPrincipal, 0) || 0;

    return (
        <AuthGuard requiredRole="lender">
            <div className="min-h-screen bg-background">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-trust-green/10 to-emerald-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 min-h-screen">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                        <BackButton />

                        <h1 className="text-3xl font-bold mb-2">Your Lending Portfolio</h1>
                        <p className="text-foreground/70 mb-8">
                            Track your investments, returns, and active lending positions.
                        </p>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-trust-green" />
                                    <span className="text-xs text-foreground/60">Total Invested</span>
                                </div>
                                <div className="text-xl font-bold">{formatCurrencyMinor(totalInvested)}</div>
                            </div>
                            <div className="p-4 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-violet-500" />
                                    <span className="text-xs text-foreground/60">Interest Earned</span>
                                </div>
                                <div className="text-xl font-bold">{formatCurrencyMinor(totalReturns)}</div>
                            </div>
                            <div className="p-4 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs text-foreground/60">Principal Repaid</span>
                                </div>
                                <div className="text-xl font-bold">{formatCurrencyMinor(totalRepaid)}</div>
                            </div>
                            <div className="p-4 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs text-foreground/60">Active Positions</span>
                                </div>
                                <div className="text-xl font-bold">{positions?.length || 0}</div>
                            </div>
                        </div>

                        {/* Positions */}
                        <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                            {isLoading ? (
                                <PortfolioLoader />
                            ) : !positions || positions.length === 0 ? (
                                <NoPortfolioEmptyState />
                            ) : (
                                <div className="space-y-4">
                                    {positions.map((position) => {
                                        const statusConfig = getStatusConfig(position.state);
                                        const outstanding = position.principal - position.repaidPrincipal;
                                        const totalEarned = position.repaidInterest;
                                        const roi = position.principal > 0 ? ((totalEarned + position.repaidPrincipal) / position.principal - 1) * 100 : 0;

                                        return (
                                            <motion.div
                                                key={position.loanId}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 border border-border/20 rounded-xl bg-background hover:bg-surface-2 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold text-lg">Loan Investment</h3>
                                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                                                                {statusConfig.icon}
                                                                {statusConfig.label}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-foreground/50 font-mono">
                                                            PDA: {position.loanId.slice(0, 8)}...{position.loanId.slice(-8)}
                                                            <button
                                                                onClick={() => handleCopyLoanId(position.loanId)}
                                                                className="ml-2 p-1 hover:bg-surface-3 rounded transition-colors"
                                                                title="Copy full loan ID"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {position.amount && (
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold">{formatCurrencyMinor(position.amount)}</div>
                                                            <div className="text-xs text-foreground/60">Loan Amount</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Position Details Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <div className="text-xs text-foreground/60 mb-1">Your Investment</div>
                                                        <div className="font-semibold">{formatCurrencyMinor(position.principal)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-foreground/60 mb-1">Outstanding</div>
                                                        <div className="font-semibold">{formatCurrencyMinor(outstanding)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-foreground/60 mb-1">Interest Earned</div>
                                                        <div className="font-semibold text-green-500">{formatCurrencyMinor(totalEarned)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-foreground/60 mb-1">ROI</div>
                                                        <div className={`font-semibold ${roi > 0 ? 'text-green-500' : roi === 0 ? 'text-foreground' : 'text-red-500'}`}>
                                                            {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Info */}
                                                {(position.termMonths || position.aprBps) && (
                                                    <div className="flex items-center gap-4 pt-4 border-t border-border/20">
                                                        {position.termMonths && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Calendar className="w-4 h-4 text-foreground/60" />
                                                                <span className="text-foreground/70">Term: {position.termMonths.toFixed(1)} months</span>
                                                            </div>
                                                        )}
                                                        {position.aprBps && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <TrendingUp className="w-4 h-4 text-foreground/60" />
                                                                <span className="text-foreground/70">APR: {bpsToPct(position.aprBps)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-sm ml-auto">
                                                            <span className="text-foreground/60">Share: {(position.proRataBps / 100).toFixed(2)}%</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
