"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart, Zap } from "lucide-react";
import Link from "next/link";
import { useRecentLoansList } from "../../../hooks/use-loans";
import { LoanCard } from "../../../components/lender/loan-card";
import { LoanFilters } from "../../../components/lender/filters";
import { LoansLoader, NoLoansEmptyState } from "../../../components/shared/loader";
import { AuthGuard } from "../../../components/shared/auth-guard";

export default function LenderDashboard() {

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

    function LendingGrid() {
        const { data, isLoading } = useRecentLoansList();

        return (
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
        );
    }

    return (
        <AuthGuard requiredRole="lender">
            <div className="min-h-screen bg-background">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-trust-green/10 to-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-3xl" />
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
                                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <DollarSign className="w-5 h-5 text-trust-green" />
                                        <span className="text-sm font-medium text-foreground/70">Total Invested</span>
                                    </div>
                                    <div className="text-2xl font-bold">$0</div>
                                    <div className="text-xs text-foreground/60">Start lending to earn</div>
                                </div>

                                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="w-5 h-5 text-violet-500" />
                                        <span className="text-sm font-medium text-foreground/70">Total Returns</span>
                                    </div>
                                    <div className="text-2xl font-bold">$0</div>
                                    <div className="text-xs text-foreground/60">12.4% avg APY</div>
                                </div>

                                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <PieChart className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm font-medium text-foreground/70">Active Loans</span>
                                    </div>
                                    <div className="text-2xl font-bold">0</div>
                                    <div className="text-xs text-foreground/60">No active positions</div>
                                </div>

                                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Zap className="w-5 h-5 text-warning-amber" />
                                        <span className="text-sm font-medium text-foreground/70">Available</span>
                                    </div>
                                    <div className="text-2xl font-bold">$0</div>
                                    <div className="text-xs text-foreground/60">Ready to invest</div>
                                </div>
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
                                <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                    <div className="text-center py-8">
                                        <PieChart className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                                        <p className="text-foreground/60">No active positions</p>
                                        <p className="text-sm text-foreground/50">
                                            Start funding loans to build your portfolio
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
