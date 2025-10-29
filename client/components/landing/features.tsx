"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock } from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: Shield,
            title: "Trustless Lending",
            description: "Smart-contract escrow ensures both borrowers and lenders are protected through secure, transparent on-chain mechanisms.",
        },
        {
            icon: Zap,
            title: "ZK-Powered Credit",
            description: "Privacy-preserving credit scoring—prove creditworthiness without exposing personal financial data.",
        },
        {
            icon: Lock,
            title: "Instant Liquidity",
            description: "Execute loans at Solana speed with minimal fees. Borrow when you need, repay on your terms.",
        },
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
        <section
            id="features"
            className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background"
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
<<<<<<< Updated upstream
                        Why CrediSol?
=======
                        Why CrediSOL?
>>>>>>> Stashed changes
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                        A new standard for lending. No collateral requirements, no gatekeepers, just smart contracts and zero-knowledge magic.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/0 border border-border/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/10 dark:from-violet-600/5 dark:to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                                <div className="relative p-8 border border-border/30 rounded-2xl bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-colors duration-300">
                                    <motion.div
                                        className="mb-6 w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center"
                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                    >
                                        <Icon className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                                    </motion.div>

                                    <h3 className="text-xl font-semibold mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-foreground/60 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
