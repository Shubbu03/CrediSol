"use client";

import { motion } from "framer-motion";
import {
    Shield,
    Zap,
    Lock,
    Cpu,
    Network,
    Eye,
    ArrowRight,
    CheckCircle,
    Clock,
    DollarSign,
    Users,
    Activity
} from "lucide-react";
import { useState } from "react";

export default function TechnicalDifferentiators() {
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            title: "Zero-Knowledge Privacy",
            description: "Prove creditworthiness without revealing data",
            icon: Shield,
            color: "from-violet-500 to-purple-500",
            details: [
                "Financial data stays on your device",
                "ZK proofs generated locally",
                "No central database of personal info",
                "Mathematically guaranteed privacy"
            ],
            technical: {
                protocol: "zk-SNARKs",
                proofSize: "< 1KB",
                verificationTime: "< 100ms",
                privacyLevel: "100%"
            }
        },
        {
            title: "Solana Speed",
            description: "Lightning-fast transactions at minimal cost",
            icon: Zap,
            color: "from-blue-500 to-cyan-500",
            details: [
                "Sub-second transaction finality",
                "Micro-fee structure",
                "High throughput capacity",
                "No network congestion"
            ],
            technical: {
                protocol: "Solana",
                tps: "65,000+",
                finality: "< 400ms",
                cost: "< $0.001"
            }
        },
        {
            title: "Smart Contract Security",
            description: "Battle-tested smart contracts with formal verification",
            icon: Cpu,
            color: "from-emerald-500 to-teal-500",
            details: [
                "Formally verified contracts",
                "Multi-signature governance",
                "Time-locked upgrades",
                "Emergency pause mechanisms"
            ],
            technical: {
                protocol: "Anchor Framework",
                audits: "3+ Security Firms",
                coverage: "100%",
                uptime: "99.9%"
            }
        },
        {
            title: "Decentralized Architecture",
            description: "No single point of failure, fully decentralized",
            icon: Network,
            color: "from-orange-500 to-red-500",
            details: [
                "Distributed across Solana validators",
                "No central authority",
                "Community governance",
                "Open source codebase"
            ],
            technical: {
                protocol: "Solana Validators",
                nodes: "2,000+",
                decentralization: "100%",
                governance: "DAO"
            }
        }
    ];

    const comparisons = [
        {
            metric: "Transaction Speed",
            CrediSol: "0.4s",
            traditional: "3-5 days",
            improvement: "99.9% faster"
        },
        {
            metric: "Privacy Level",
            CrediSol: "100%",
            traditional: "0%",
            improvement: "Complete privacy"
        },
        {
            metric: "Collateral Required",
            CrediSol: "5-20%",
            traditional: "150%+",
            improvement: "95% less"
        },
        {
            metric: "Transaction Cost",
            CrediSol: "< $0.001",
            traditional: "$50-200",
            improvement: "99.9% cheaper"
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
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background">
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
                        Technical Excellence
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                        Built with cutting-edge technology for maximum security, privacy, and performance.
                    </p>
                </motion.div>

                {/* Feature Tabs */}
                <motion.div
                    className="flex flex-wrap justify-center gap-2 mb-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.button
                                key={index}
                                variants={itemVariants}
                                onClick={() => setActiveFeature(index)}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${activeFeature === index
                                    ? "bg-violet-600 text-white shadow-lg"
                                    : "bg-muted/50 text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon className="w-4 h-4" />
                                {feature.title}
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Active Feature Details */}
                <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
                >
                    {/* Feature Info */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center`}>
                                {(() => {
                                    const Icon = features[activeFeature].icon;
                                    return <Icon className="w-8 h-8 text-white" />;
                                })()}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">
                                    {features[activeFeature].title}
                                </h3>
                                <p className="text-foreground/60">
                                    {features[activeFeature].description}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-3 mb-8"
                        >
                            {features[activeFeature].details.map((detail, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <span className="text-foreground/70">{detail}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Technical Specs */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-2xl p-8"
                    >
                        <h4 className="text-xl font-semibold mb-6">Technical Specifications</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(features[activeFeature].technical).map(([key, value], index) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="text-center p-4 bg-background/50 rounded-lg"
                                >
                                    <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">
                                        {value}
                                    </div>
                                    <div className="text-sm text-foreground/60 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Performance Comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-muted/30 rounded-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-center mb-8">Performance Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {comparisons.map((comparison, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-sm text-foreground/60 mb-3">{comparison.metric}</div>
                                <div className="space-y-2">
                                    <div className="bg-red-500/10 text-red-600 px-3 py-2 rounded-lg text-sm">
                                        Traditional: {comparison.traditional}
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-600 px-3 py-2 rounded-lg text-sm font-semibold">
                                        CrediSol: {comparison.CrediSol}
                                    </div>
                                    <div className="text-xs text-emerald-500 font-medium">
                                        {comparison.improvement}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Architecture Diagram Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-16 text-center"
                >
                    <h3 className="text-2xl font-bold mb-8">System Architecture</h3>
                    <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-2xl p-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <motion.div
                                className="text-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h4 className="font-semibold mb-2">Users</h4>
                                <p className="text-sm text-foreground/60">Borrowers & Lenders</p>
                            </motion.div>

                            <motion.div
                                className="flex justify-center"
                                animate={{ x: [0, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <ArrowRight className="w-8 h-8 text-violet-500" />
                            </motion.div>

                            <motion.div
                                className="text-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                                    <Cpu className="w-10 h-10 text-white" />
                                </div>
                                <h4 className="font-semibold mb-2">Smart Contracts</h4>
                                <p className="text-sm text-foreground/60">Automated Logic</p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
