"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, PieChart, Clock, Zap } from "lucide-react";
import { useUserRole } from "../../../hooks/use-user-role";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LenderDashboard() {
    const { role, isLoading, resetOnboarding } = useUserRole();
    const { connected } = useWallet();
    const router = useRouter();

    // Redirect only if wrong role; allow disconnected wallets and show connect prompt
    useEffect(() => {
        if (!isLoading && role && role !== "lender") {
            router.push("/onboarding");
        }
    }, [isLoading, role, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    // If wallet is disconnected, render a lightweight connect prompt inside dashboard
    if (!connected) {
        return (
            <div className="min-h-screen bg-background">
                <div className="pt-24 max-w-xl mx-auto px-4">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">Connect your wallet</h1>
                        <p className="text-foreground/70">Please connect your Solana wallet to access your lender dashboard.</p>
                    </div>
                    <div className="flex justify-center">
                        <WalletMultiButton />
                    </div>
                </div>
            </div>
        );
    }

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

    return (
        <div className="min-h-screen bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-trust-green/10 to-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <div className="border-b border-border bg-background/80 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">zk</span>
                                </div>
                                <span className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                                    zkLend
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-trust-green/10 text-trust-green text-sm font-medium rounded-full">
                                    Lender
                                </div>
                                {/* Debug button - remove in production */}
                                <button
                                    onClick={resetOnboarding}
                                    className="px-3 py-1 bg-red-500/10 text-red-600 text-xs font-medium rounded-full hover:bg-red-500/20 transition-colors"
                                >
                                    Reset Onboarding
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Welcome Section */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Welcome to your Lender Dashboard</h1>
                            <p className="text-foreground/70">
                                Browse lending opportunities, manage your portfolio, and earn high yields on your capital.
                            </p>
                        </motion.div>

                        {/* Stats Grid */}
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

                        {/* Lending Opportunities */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Available Lending Opportunities</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    {
                                        id: 1,
                                        borrower: "Credit Score: 780",
                                        amount: "$5,000",
                                        term: "6 months",
                                        apy: "12.4%",
                                        risk: "Low",
                                        collateral: "5%",
                                    },
                                    {
                                        id: 2,
                                        borrower: "Credit Score: 720",
                                        amount: "$3,000",
                                        term: "3 months",
                                        apy: "11.8%",
                                        risk: "Medium",
                                        collateral: "8%",
                                    },
                                    {
                                        id: 3,
                                        borrower: "Credit Score: 800",
                                        amount: "$7,500",
                                        term: "12 months",
                                        apy: "13.2%",
                                        risk: "Low",
                                        collateral: "4%",
                                    },
                                ].map((opportunity) => (
                                    <motion.div
                                        key={opportunity.id}
                                        className="p-6 bg-surface-1 rounded-xl border border-border/30 hover:border-trust-green/30 transition-colors"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-sm font-medium text-foreground/70">
                                                {opportunity.borrower}
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${opportunity.risk === "Low"
                                                ? "bg-trust-green/10 text-trust-green"
                                                : "bg-warning-amber/10 text-warning-amber"
                                                }`}>
                                                {opportunity.risk} Risk
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-foreground/70">Amount</span>
                                                <span className="font-semibold">{opportunity.amount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-foreground/70">Term</span>
                                                <span className="font-semibold">{opportunity.term}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-foreground/70">APY</span>
                                                <span className="font-semibold text-trust-green">{opportunity.apy}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-foreground/70">Collateral</span>
                                                <span className="font-semibold">{opportunity.collateral}</span>
                                            </div>
                                        </div>

                                        <motion.button
                                            className="w-full py-2 bg-gradient-to-r from-trust-green to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-trust-green/30 transition-all duration-300"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Fund Loan
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Portfolio Overview */}
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-semibold mb-4">Portfolio Overview</h2>
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
    );
}
