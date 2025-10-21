"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, CreditCard, DollarSign, Clock } from "lucide-react";
import { useUserRole } from "../../../hooks/use-user-role";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
const WalletMultiButton = dynamic(
    () => import("@solana/wallet-adapter-react-ui").then(mod => mod.WalletMultiButton),
    { ssr: false }
);
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BorrowerDashboard() {
    const { role, isLoading, resetOnboarding } = useUserRole();
    const { connected } = useWallet();
    const router = useRouter();

    // Redirect only if wrong role; allow disconnected wallets and show connect prompt
    useEffect(() => {
        if (!isLoading && role && role !== "borrower") {
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
                        <p className="text-foreground/70">Please connect your Solana wallet to access your borrower dashboard.</p>
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
                <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-full blur-3xl" />
                {/* <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl" /> */}
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
                                <div className="px-3 py-1 bg-violet-500/10 text-violet-600 text-sm font-medium rounded-full">
                                    Borrower
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
                            <h1 className="text-3xl font-bold mb-2">Welcome to your Borrower Dashboard</h1>
                            <p className="text-foreground/70">
                                Manage your loans, view your credit score, and apply for new undercollateralized loans.
                            </p>
                        </motion.div>

                        {/* Stats Grid */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                        >
                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-trust-green" />
                                    <span className="text-sm font-medium text-foreground/70">Available Credit</span>
                                </div>
                                <div className="text-2xl font-bold">$10,000</div>
                                <div className="text-xs text-foreground/60">Based on your credit score</div>
                            </div>

                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <CreditCard className="w-5 h-5 text-violet-500" />
                                    <span className="text-sm font-medium text-foreground/70">Active Loans</span>
                                </div>
                                <div className="text-2xl font-bold">0</div>
                                <div className="text-xs text-foreground/60">No active loans</div>
                            </div>

                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-foreground/70">Credit Score</span>
                                </div>
                                <div className="text-2xl font-bold">750</div>
                                <div className="text-xs text-foreground/60">Excellent rating</div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button
                                    className="p-6 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 text-left"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/dashboard/borrower/apply')}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <ArrowRight className="w-5 h-5" />
                                        <span className="font-semibold">Apply for Loan</span>
                                    </div>
                                    <p className="text-sm text-white/80">
                                        Get an undercollateralized loan using your credit score
                                    </p>
                                </motion.button>

                                <motion.button
                                    className="p-6 bg-surface-1 border border-border rounded-xl hover:bg-surface-2 transition-colors text-left"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="w-5 h-5 text-trust-green" />
                                        <span className="font-semibold">View Credit Score</span>
                                    </div>
                                    <p className="text-sm text-foreground/70">
                                        Check your latest credit attestations
                                    </p>
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                                    <p className="text-foreground/60">No recent activity</p>
                                    <p className="text-sm text-foreground/50">
                                        Your loan applications and transactions will appear here
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
