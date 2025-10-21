"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, TrendingUp, Users, Zap, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserRole } from "../../hooks/use-user-role";
import { useAnimationStore } from "../../stores/animation-store";

interface Transaction {
    id: string;
    amount: number;
    type: "borrow" | "lend";
    time: string;
}

export default function Hero() {
    const router = useRouter();
    const { connected } = useWallet();
    const { role, onboarded } = useUserRole();

    const { stats, recentTransactions, animateStats, generateTransactions } = useAnimationStore();

    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], [0, 50]);
    const y2 = useTransform(scrollY, [0, 300], [0, -50]);
    const opacity = useTransform(scrollY, [0, 200], [1, 0]);

    const [dots, setDots] = useState<{ left: string; top: string; duration: number; delay: number }[]>([]);

    useEffect(() => {
        animateStats();
        generateTransactions();

        const generatedDots = [...Array(12)].map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
        }));
        setDots(generatedDots);
    }, [animateStats, generateTransactions]);

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
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 },
        },
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 px-4 bg-background">

            <motion.div
                className="absolute inset-0 -z-10"
                style={{ opacity }}
            >

                <motion.div
                    style={{ y: y1 }}
                    className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full blur-3xl"
                />

                {dots.map((dot, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-violet-500/30 rounded-full"
                        style={{ left: dot.left, top: dot.top }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: dot.duration,
                            repeat: Infinity,
                            delay: dot.delay,
                        }}
                    />
                ))}

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </motion.div>

            <div className="relative z-10 max-w-7xl w-full mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 border border-border/30">
                                <Shield className="w-4 h-4 text-trust-green" />
                                <span className="text-sm font-medium">
                                    Secure
                                </span>
                            </div>

                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                        >
                            Borrow{" "}
                            <span className="gradient-text">$10,000</span>
                            <br />
                            with just{" "}
                            <span className="gradient-text">$500</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl text-foreground/70 mb-8 leading-relaxed"
                        >
                            Zero-knowledge proofs replace excessive collateral. Your data
                            stays private. Your capital stays free.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 mb-12"
                        >
                            <motion.a
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (connected && onboarded && role) {
                                        router.push(role === "borrower" ? "/dashboard/borrower" : "/dashboard/lender");
                                    } else {
                                        router.push("/onboarding");
                                    }
                                }}
                                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </motion.a>
                            {/* <motion.a
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onboarded && role && connected) {
                                        router.push(role === "borrower" ? "/dashboard/borrower" : "/dashboard/lender");
                                    } else {
                                        router.push("/onboarding");
                                    }
                                }}
                                className="px-8 py-4 border-2 border-border text-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                                whileHover={{
                                    scale: 1.05,
                                    y: -2,
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Lending
                                <TrendingUp className="w-5 h-5" />
                            </motion.a> */}
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-3 gap-6"
                        >
                            <div>
                                <div className="text-3xl font-bold text-trust-green mb-1 tabular-nums">
                                    ${(stats.totalVolume / 1000000).toFixed(1)}M
                                </div>
                                <div className="text-sm text-foreground/60">Total Volume</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-violet-500 mb-1 tabular-nums">
                                    {stats.activeLoans.toLocaleString()}
                                </div>
                                <div className="text-sm text-foreground/60">Active Loans</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-blue-500 mb-1 tabular-nums">
                                    {stats.avgApy}%
                                </div>
                                <div className="text-sm text-foreground/60">Avg APY</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="hidden lg:block"
                    >
                        <div className="relative">
                            <div className="absolute -top-13.5 left-0 flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full border border-border/30">
                                <div className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
                                <span className="text-sm font-medium">Live Activity</span>
                            </div>

                            <div className="mt-8 space-y-3">
                                {recentTransactions.map((tx, index) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="glass-card rounded-xl p-4 hover:bg-surface-2 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "borrow"
                                                        ? "bg-violet-500/20"
                                                        : "bg-trust-green/20"
                                                        }`}
                                                >
                                                    {tx.type === "borrow" ? (
                                                        <ArrowRight className="w-5 h-5 text-violet-500" />
                                                    ) : (
                                                        <TrendingUp className="w-5 h-5 text-trust-green" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">
                                                        {tx.type === "borrow" ? "Borrowed" : "Lent"}
                                                    </div>
                                                    <div className="text-sm text-foreground/60">
                                                        {tx.time}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold tabular-nums">
                                                    ${tx.amount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-foreground/60">
                                                    {tx.type === "borrow" ? "5% collateral" : "12.4% APY"}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="mt-8 p-6 glass-card rounded-xl"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-foreground/60">
                                        Network Activity
                                    </span>
                                    <Zap className="w-4 h-4 text-warning-amber" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-foreground/70">Processing Speed</span>
                                        <span className="font-semibold text-trust-green">
                                            0.4s avg
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-foreground/70">Active Users</span>
                                        <span className="font-semibold">{stats.lenders}+</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-foreground/70">Success Rate</span>
                                        <span className="font-semibold text-trust-green">
                                            99.2%
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-2">
                    <motion.div
                        className="w-1 h-2 bg-foreground/40 rounded-full"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    );
}
