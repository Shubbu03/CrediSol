"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart, Zap } from "lucide-react";
import Link from "next/link";
import { useRecentLoansList, usePortfolio, formatCurrencyMinor } from "../../../hooks/use-loans";
import { LoanCard } from "../../../components/lender/loan-card";
import { LoanFilters } from "../../../components/lender/filters";
import { LoansLoader, NoLoansEmptyState } from "../../../components/shared/loader";
import { AuthGuard } from "../../../components/shared/auth-guard";

export default function LenderDashboard() {
    const { data: portfolio } = usePortfolio();

    const totalInvested = portfolio?.reduce((sum, p) => sum + p.principal, 0) || 0;
    const totalReturns = portfolio?.reduce((sum, p) => sum + p.repaidInterest, 0) || 0;
    const activePositions = portfolio?.length || 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    };

    function DashboardSummaryCard({ icon, label }: { icon: React.ReactNode; label: string }) {
        let value = "$0";
        let subtitle = "Start lending to earn";
        
        if (label === "Total Invested") {
            value = formatCurrencyMinor(totalInvested);
            subtitle = "Your capital deployed";
        } else if (label === "Total Returns") {
            value = formatCurrencyMinor(totalReturns);
            subtitle = "Interest earned";
        } else if (label === "Active Loans") {
            value = activePositions.toString();
            subtitle = activePositions > 0 ? `${activePositions} active positions` : "No active positions";
        } else if (label === "Available") {
            value = "$0"; // Could be wallet balance
            subtitle = "Ready to invest";
        }

        return (
            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                <div className="flex items-center gap-3 mb-2">
                    {icon}
                    <span className="text-sm font-medium text-foreground/70">{label}</span>
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-foreground/60">{subtitle}</div>
            </div>
        );
    }

    function LendingGrid() {
        const { data, isLoading } = useRecentLoansList();
        const { data: portfolio } = usePortfolio();

        // Calculate portfolio stats
        const totalInvested = portfolio?.reduce((sum, p) => sum + p.principal, 0) || 0;
        const totalReturns = portfolio?.reduce((sum, p) => sum + p.repaidInterest, 0) || 0;
        const activePositions = portfolio?.length || 0;

        return (
            <>
                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                    {isLoading ? (
                        <LoansLoader />
                    ) : !data || data.length === 0 ? (
                        <NoLoansEmptyState />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.map((loan) => (
                                <LoanCard key={loan.id} loan={loan} />
                            ))}
                        </div>
                    )}
                </div>
            </>
        );
    }

    function PortfolioOverview() {
        const { data: portfolio, isLoading } = usePortfolio();

        if (isLoading || !portfolio || portfolio.length === 0) {
            return (
                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                    <div className="text-center py-8">
                        <PieChart className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                        <p className="text-foreground/60">No active positions</p>
                        <p className="text-sm text-foreground/50">
                            Start funding loans to build your portfolio
                        </p>
                    </div>
                </div>
            );
        }

        const totalInvested = portfolio.reduce((sum, p) => sum + p.principal, 0);
        const totalReturns = portfolio.reduce((sum, p) => sum + p.repaidInterest, 0);
        const recentPositions = portfolio.slice(0, 3);

        return (
            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-foreground/60">Total Portfolio Value</span>
                        <span className="text-lg font-bold">{formatCurrencyMinor(totalInvested)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground/60">Total Returns</span>
                        <span className="text-lg font-bold text-green-500">{formatCurrencyMinor(totalReturns)}</span>
                    </div>
                </div>
                <div className="space-y-2 border-t border-border/20 pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">Recent Investments</h3>
                    {recentPositions.map((position) => (
                        <div key={position.loanId} className="flex items-center justify-between p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors">
                            <div className="text-xs font-mono text-foreground/60">
                                {position.loanId.slice(0, 8)}...
                            </div>
                            <div className="text-sm font-semibold">{formatCurrencyMinor(position.principal)}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <AuthGuard requiredRole="lender">
            <div className="min-h-screen bg-background">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-trust-green/10 to-emerald-500/10 rounded-full blur-3xl" />
                    {/* <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-3xl" /> */}
                </div>

                <div className="relative z-10 min-h-screen">

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="mb-8">
                                <h1 className="text-3xl font-bold mb-2">Welcome to your Lender Dashboard</h1>
                                <p className="text-foreground/70">
                                    Browse lending opportunities, manage your portfolio, and earn high yields on your capital.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                            >
                                <DashboardSummaryCard icon={<DollarSign className="w-5 h-5 text-trust-green" />} label="Total Invested" />
                                <DashboardSummaryCard icon={<TrendingUp className="w-5 h-5 text-violet-500" />} label="Total Returns" />
                                <DashboardSummaryCard icon={<PieChart className="w-5 h-5 text-blue-500" />} label="Active Loans" />
                                <DashboardSummaryCard icon={<Zap className="w-5 h-5 text-warning-amber" />} label="Available" />
                            </motion.div>

                            <motion.div variants={itemVariants} className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Available Lending Opportunities</h2>
                                    <Link href="/marketplace" className="text-sm text-foreground/70 hover:text-foreground">
                                        To Marketplace →
                                    </Link>
                                </div>
                                <div className="mb-4">
                                    <LoanFilters />
                                </div>
                                <LendingGrid />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Portfolio Overview</h2>
                                    <Link href="/dashboard/lend/portfolio" className="text-sm text-foreground/70 hover:text-foreground">
                                        View Portfolio →
                                    </Link>
                                </div>
                                <PortfolioOverview />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
