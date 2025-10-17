"use client";

import { motion } from "framer-motion";
import { User, DollarSign, RefreshCw } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            number: 1,
            icon: User,
            title: "Connect Wallet & Verify Score",
            description: "Link your Solana wallet and prove your creditworthiness with zero-knowledge proofs. Your financial data stays private.",
        },
        {
            number: 2,
            icon: DollarSign,
            title: "Request or Fund Loan",
            description: "Borrowers request undercollateralized loans. Lenders fund loans and earn yield. All secured by smart contracts.",
        },
        {
            number: 3,
            icon: RefreshCw,
            title: "Earn, Repay, or Re-use Credit",
            description: "Borrowers repay on schedule and build reputation. Lenders earn APY. Reuse your credit for future loans.",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7 },
        },
    };

    return (
        <section
            id="how-it-works"
            className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/50"
        >
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                        A simple, transparent three-step process from wallet connection to earning or borrowing.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-transparent" />

                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.number}
                                variants={itemVariants}
                                className="relative"
                            >
                                <div className="hidden md:flex absolute -top-28 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 items-center justify-center border-4 border-background shadow-lg">
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                <div className="pt-8 md:pt-40">
                                    <motion.div className="md:hidden mb-4 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                            {step.number}
                                        </div>
                                        <Icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                    </motion.div>

                                    <div className="bg-background border border-border/40 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-foreground/60 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
