"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    TrendingUp,
    Shield,
    CreditCard,
    DollarSign,
    Clock,
} from "lucide-react";
import { useUserRole } from "../../../hooks/use-user-role";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import idl from "../../../lib/program/idl/loans_marketplace.json";
import type { LoansMarketplace } from "../../../lib/program/types/loans_marketplace";
import { useUserLoans } from "../../../hooks/use-user-loan";

const WalletMultiButton = dynamic(
    () =>
        import("@solana/wallet-adapter-react-ui").then(
            (mod) => mod.WalletMultiButton
        ),
    { ssr: false }
);

const RPC_URL = "https://api.devnet.solana.com";

export default function BorrowerDashboard() {
    const { role, isLoading, resetOnboarding } = useUserRole();
    const { connected, wallet, publicKey } = useWallet();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && role && role !== "borrower") {
            router.push("/onboarding");
        }
    }, [isLoading, role, router]);

    const connection = useMemo(() => new Connection(RPC_URL, "confirmed"), []);
    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet as any, {
            commitment: "confirmed",
        });
        return new Program<LoansMarketplace>(idl as any, provider);
    }, [wallet, connection]);

    const { loans, loading: loansLoading } = useUserLoans(
        program,
        publicKey?.toString()
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="min-h-screen bg-background">
                <div className="pt-24 max-w-xl mx-auto px-4">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">
                            Connect your wallet
                        </h1>
                        <p className="text-foreground/70">
                            Please connect your Solana wallet to access your
                            borrower dashboard.
                        </p>
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
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen">
                <div className="max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">
                                Welcome to your Borrower Dashboard
                            </h1>
                            <p className="text-foreground/70">
                                Manage your loans, view your credit score, and
                                apply for new undercollateralized loans.
                            </p>
                        </motion.div>

                        {/* Summary cards */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                        >
                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-trust-green" />
                                    <span className="text-sm font-medium text-foreground/70">
                                        Available Credit
                                    </span>
                                </div>
                                <div className="text-2xl font-bold">
                                    $10,000
                                </div>
                                <div className="text-xs text-foreground/60">
                                    Based on your credit score
                                </div>
                            </div>

                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <CreditCard className="w-5 h-5 text-violet-500" />
                                    <span className="text-sm font-medium text-foreground/70">
                                        Active Loans
                                    </span>
                                </div>
                                <div className="text-2xl font-bold">
                                    {loans?.length || 0}
                                </div>
                                <div className="text-xs text-foreground/60">
                                    {loans?.length
                                        ? "Currently active loans"
                                        : "No active loans"}
                                </div>
                            </div>

                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-foreground/70">
                                        Credit Score
                                    </span>
                                </div>
                                <div className="text-2xl font-bold">750</div>
                                <div className="text-xs text-foreground/60">
                                    Excellent rating
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button
                                    className="p-6 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 text-left"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        router.push("/dashboard/borrower/apply")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <ArrowRight className="w-5 h-5" />
                                        <span className="font-semibold">
                                            Apply for Loan
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/80">
                                        Get an undercollateralized loan using
                                        your credit score
                                    </p>
                                </motion.button>

                                <motion.button
                                    className="p-6 bg-surface-1 border border-border rounded-xl hover:bg-surface-2 transition-colors text-left"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="w-5 h-5 text-trust-green" />
                                        <span className="font-semibold">
                                            View Credit Score
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/70">
                                        Check your latest credit attestations
                                    </p>
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Recent Activity Section */}
                        <motion.div variants={itemVariants}>
                            <h2 className="text-xl font-semibold mb-4">
                                Recent Activity
                            </h2>
                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                {loansLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4" />
                                        <p className="text-foreground/60">
                                            Loading your loans...
                                        </p>
                                    </div>
                                ) : loans && loans.length > 0 ? (
                                    <div className="space-y-4">
                                        {loans.map((loan) => (
                                            <div
                                                key={loan.pubkey}
                                                className="p-4 border border-border/20 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="font-semibold">
                                                        Loan ID:{" "}
                                                        {
                                                            loan.account.loanId.toString()
                                                        }
                                                    </div>
                                                    <div
                                                        className={`text-sm px-2 py-1 rounded-full ${loan.account
                                                            .isFunded
                                                            ? "bg-green-500/10 text-green-500"
                                                            : "bg-yellow-500/10 text-yellow-500"
                                                            }`}
                                                    >
                                                        {loan.account.isFunded
                                                            ? "Funded"
                                                            : "Pending"}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-foreground/70">
                                                    Amount:{" "}
                                                    {(
                                                        Number(
                                                            loan.account.amount
                                                        ) / 1_000_000
                                                    ).toLocaleString()}{" "}
                                                    USDC
                                                </div>
                                                <div className="text-sm text-foreground/60">
                                                    Term:{" "}
                                                    {(
                                                        Number(
                                                            loan.account.termSecs
                                                        ) /
                                                        (60 * 60 * 24 * 30)
                                                    ).toFixed(1)}{" "}
                                                    months
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Clock className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                                        <p className="text-foreground/60">
                                            No recent activity
                                        </p>
                                        <p className="text-sm text-foreground/50">
                                            Your loan applications and
                                            transactions will appear here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
