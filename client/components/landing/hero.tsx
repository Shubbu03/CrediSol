"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, DollarSign, Lock, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
    const [stats, setStats] = useState({
        totalVolume: 0,
        activeLoans: 0,
        lenders: 0,
        avgApy: 0
    });

    // Animate stats on mount
    useEffect(() => {
        const targetStats = {
            totalVolume: 12470000,
            activeLoans: 2847,
            lenders: 1243,
            avgApy: 12.4
        };

        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setStats({
                totalVolume: Math.floor(targetStats.totalVolume * progress),
                activeLoans: Math.floor(targetStats.activeLoans * progress),
                lenders: Math.floor(targetStats.lenders * progress),
                avgApy: Number((targetStats.avgApy * progress).toFixed(1))
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                setStats(targetStats);
            }
        }, stepDuration);

        return () => clearInterval(interval);
    }, []);

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
            {/* Animated Background Elements */}
            <motion.div
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
            >
                {/* Floating Currency Symbols */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-4xl text-violet-500/20 dark:text-violet-400/20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, 0],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    >
                        {i % 3 === 0 ? "$" : i % 3 === 1 ? "₿" : "SOL"}
                    </motion.div>
                ))}

                {/* Lock/Unlock Animation */}
                <motion.div
                    className="absolute top-1/4 right-1/4 w-32 h-32"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Lock className="w-full h-full text-violet-500/10 dark:text-violet-400/10" />
                </motion.div>

                {/* Gradient Orbs */}
                <motion.div
                    className="absolute top-1/4 -left-1/2 w-96 h-96 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-full blur-3xl"
                    animate={{
                        y: [0, 50, 0],
                        x: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-full blur-3xl"
                    animate={{
                        y: [0, -50, 0],
                        x: [0, -30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                />
            </motion.div>

            <motion.div
                className="relative z-10 max-w-4xl text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Problem Statement */}
                <motion.div
                    variants={itemVariants}
                    className="mb-8"
                >
                    <motion.p
                        className="text-lg sm:text-xl text-foreground/60 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Collateral locks your capital. Credit checks expose your data. Traditional lending fails.
                    </motion.p>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
                >
                    <span className="text-foreground">Access liquidity</span>
                    <br />
                    <span className="bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400 bg-clip-text text-transparent">
                        without barriers.
                    </span>
                </motion.h1>

                {/* Solution Description */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed"
                >
                    zkLend enables instant, undercollateralized loans powered by zero-knowledge credit scoring.
                    Your data stays private. Your capital stays free.
                </motion.p>

                {/* Live Stats Ticker */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-3xl mx-auto"
                >
                    <motion.div
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-4"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-foreground/60">Total Volume</span>
                        </div>
                        <div className="text-2xl font-bold tabular-nums">
                            ${stats.totalVolume.toLocaleString()}
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-4"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-foreground/60">Active Loans</span>
                        </div>
                        <div className="text-2xl font-bold tabular-nums">
                            {stats.activeLoans.toLocaleString()}
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-4"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-violet-500" />
                            <span className="text-sm text-foreground/60">Lenders</span>
                        </div>
                        <div className="text-2xl font-bold tabular-nums">
                            {stats.lenders.toLocaleString()}
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-4"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-foreground/60">Avg APY</span>
                        </div>
                        <div className="text-2xl font-bold tabular-nums">
                            {stats.avgApy}%
                        </div>
                    </motion.div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <motion.a
                        href="/app"
                        className="px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 flex items-center gap-2"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
                            y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </motion.a>
                    <motion.button
                        className="px-8 py-4 border-2 border-foreground/20 text-foreground font-semibold rounded-lg hover:bg-foreground/5 transition-colors duration-300"
                        whileHover={{
                            scale: 1.05,
                            borderColor: "currentColor",
                            y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const howItWorksSection = document.getElementById("how-it-works");
                            howItWorksSection?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        See How It Works
                    </motion.button>
                </motion.div>
            </motion.div>
        </section>
    );
}
