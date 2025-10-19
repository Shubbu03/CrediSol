"use client";

import { motion } from "framer-motion";
import {
    Lock,
    Clock,
    Shield,
    Eye,
    DollarSign,
    Zap,
    CheckCircle,
    XCircle,
    ArrowRight,
    TrendingUp
} from "lucide-react";
import { useState } from "react";

export default function ProblemSolution() {
    const [activeComparison, setActiveComparison] = useState(0);

    const comparisons = [
        {
            problem: {
                title: "Collateral Requirements",
                description: "Lock up 150%+ of loan value",
                icon: Lock,
                color: "text-red-500",
                bgColor: "bg-red-500/10",
                details: [
                    "Capital tied up in collateral",
                    "Opportunity cost on locked assets",
                    "Risk of liquidation",
                    "Complex margin calculations"
                ]
            },
            solution: {
                title: "Undercollateralized Loans",
                description: "Borrow with minimal collateral",
                icon: DollarSign,
                color: "text-emerald-500",
                bgColor: "bg-emerald-500/10",
                details: [
                    "Keep capital working for you",
                    "Access more liquidity",
                    "ZK proofs replace collateral",
                    "Smart contract security"
                ]
            }
        },
        {
            problem: {
                title: "Credit Checks",
                description: "Expose your financial data",
                icon: Eye,
                color: "text-red-500",
                bgColor: "bg-red-500/10",
                details: [
                    "Personal data shared with bureaus",
                    "Credit score impacts rates",
                    "Slow verification process",
                    "Privacy concerns"
                ]
            },
            solution: {
                title: "Zero-Knowledge Proofs",
                description: "Prove creditworthiness privately",
                icon: Shield,
                color: "text-violet-500",
                bgColor: "bg-violet-500/10",
                details: [
                    "Data stays on your device",
                    "Prove without revealing",
                    "Instant verification",
                    "Complete privacy"
                ]
            }
        },
        {
            problem: {
                title: "Slow Processing",
                description: "Days to weeks for approval",
                icon: Clock,
                color: "text-red-500",
                bgColor: "bg-red-500/10",
                details: [
                    "Manual review processes",
                    "Banking hours delays",
                    "Paperwork requirements",
                    "Multiple intermediaries"
                ]
            },
            solution: {
                title: "Instant Execution",
                description: "Loans funded in seconds",
                icon: Zap,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                details: [
                    "Smart contract automation",
                    "24/7 availability",
                    "No paperwork needed",
                    "Direct peer-to-peer"
                ]
            }
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    };

    return (
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        The Old Way vs. The zkLend Way
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                        See how zkLend eliminates the biggest pain points in traditional lending
                    </p>
                </motion.div>

                {/* Comparison Tabs */}
                <motion.div
                    className="flex flex-wrap justify-center gap-2 mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {comparisons.map((comparison, index) => (
                        <motion.button
                            key={index}
                            variants={itemVariants}
                            onClick={() => setActiveComparison(index)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeComparison === index
                                ? "bg-violet-600 text-white shadow-lg"
                                : "bg-background/60 text-foreground/70 hover:bg-background/80 hover:text-foreground"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {comparison.problem.title}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Active Comparison */}
                <motion.div
                    key={activeComparison}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
                >
                    {/* Problem Side */}
                    <motion.div
                        className="relative group"
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-background border-2 border-red-200/20 dark:border-red-800/20 rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl ${comparisons[activeComparison].problem.bgColor} flex items-center justify-center`}>
                                    {(() => {
                                        const Icon = comparisons[activeComparison].problem.icon;
                                        return <Icon className={`w-6 h-6 ${comparisons[activeComparison].problem.color}`} />;
                                    })()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                                        {comparisons[activeComparison].problem.title}
                                    </h3>
                                    <p className="text-red-500/70">
                                        {comparisons[activeComparison].problem.description}
                                    </p>
                                </div>
                            </div>

                            <ul className="space-y-3">
                                {comparisons[activeComparison].problem.details.map((detail, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 text-foreground/70"
                                    >
                                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        {detail}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Arrow */}
                    <div className="hidden lg:flex items-center justify-center">
                        <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center"
                        >
                            <ArrowRight className="w-6 h-6 text-white" />
                        </motion.div>
                    </div>

                    {/* Solution Side */}
                    <motion.div
                        className="relative group"
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-background border-2 border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl ${comparisons[activeComparison].solution.bgColor} flex items-center justify-center`}>
                                    {(() => {
                                        const Icon = comparisons[activeComparison].solution.icon;
                                        return <Icon className={`w-6 h-6 ${comparisons[activeComparison].solution.color}`} />;
                                    })()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                                        {comparisons[activeComparison].solution.title}
                                    </h3>
                                    <p className="text-emerald-500/70">
                                        {comparisons[activeComparison].solution.description}
                                    </p>
                                </div>
                            </div>

                            <ul className="space-y-3">
                                {comparisons[activeComparison].solution.details.map((detail, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 text-foreground/70"
                                    >
                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        {detail}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Bottom Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-500 mb-2">95%</div>
                        <div className="text-sm text-foreground/60">Less collateral required</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-violet-500 mb-2">100%</div>
                        <div className="text-sm text-foreground/60">Privacy preserved</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-2">99.9%</div>
                        <div className="text-sm text-foreground/60">Faster execution</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
