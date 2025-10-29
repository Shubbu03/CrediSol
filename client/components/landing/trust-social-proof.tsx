"use client";

import { motion } from "framer-motion";
import {
    Shield,
    TrendingUp,
    Users,
    CheckCircle,
    Star,
    Award,
    Zap,
    DollarSign,
    Lock,
    Activity,
} from "lucide-react";
import { useEffect } from "react";
import { useAnimationStore } from "../../stores/animation-store";

export default function TrustSocialProof() {
    const { extendedStats, animateExtendedStats } = useAnimationStore();

    useEffect(() => {
        animateExtendedStats();
    }, [animateExtendedStats]);

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "DeFi Trader",
            avatar: "SC",
            content: "Finally, a lending platform that doesn't lock up my trading capital. I can access liquidity instantly while keeping my positions open.",
            rating: 5,
            loanAmount: "$15,000",
            timeAgo: "2 days ago"
        },
        {
            name: "Marcus Rodriguez",
            role: "Small Business Owner",
            avatar: "MR",
            content: "The ZK proofs are incredible. I proved my creditworthiness without exposing my business financials. Game changer for privacy.",
            rating: 5,
            loanAmount: "$8,500",
            timeAgo: "1 week ago"
        },
        {
            name: "Alex Kim",
            role: "Yield Farmer",
            avatar: "AK",
            content: "Earning 12.4% APY on my idle SOL is amazing. The smart contracts handle everything automatically. Set and forget.",
            rating: 5,
            loanAmount: "$25,000",
            timeAgo: "3 days ago"
        }
    ];

    const securityFeatures = [
        {
            icon: Shield,
            title: "Smart Contract Audited",
            description: "Certified by leading security firms",
            status: "Verified"
        },
        {
            icon: Lock,
            title: "Zero-Knowledge Privacy",
            description: "Your data never leaves your device",
            status: "Active"
        },
        {
            icon: Zap,
            title: "Solana Network",
            description: "Built on the fastest blockchain",
            status: "Live"
        },
        {
            icon: Award,
            title: "Non-Custodial",
            description: "You control your funds always",
            status: "Secure"
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
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Trusted by Thousands
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
<<<<<<< Updated upstream
                        Real users, real results. See why CrediSol is the preferred choice for DeFi lending.
=======
                        Real users, real results. See why CrediSOL is the preferred choice for DeFi lending.
>>>>>>> Stashed changes
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold tabular-nums text-emerald-500">
                            ${extendedStats.totalVolume.toLocaleString()}
                        </div>
                        <div className="text-sm text-foreground/60">Total Volume</div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold tabular-nums text-blue-500">
                            {extendedStats.activeLoans.toLocaleString()}
                        </div>
                        <div className="text-sm text-foreground/60">Active Loans</div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Users className="w-8 h-8 text-violet-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold tabular-nums text-violet-500">
                            {extendedStats.lenders.toLocaleString()}
                        </div>
                        <div className="text-sm text-foreground/60">Active Lenders</div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-background/60 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                        <div className="text-2xl font-bold tabular-nums text-emerald-500">
                            {extendedStats.avgApy}%
                        </div>
                        <div className="text-sm text-foreground/60">Avg APY</div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                    <div className="text-center">
                        <div className="text-4xl font-bold text-emerald-500 mb-2">{extendedStats.defaultRate}%</div>
                        <div className="text-sm text-foreground/60">Default Rate</div>
                        <div className="text-xs text-emerald-500 mt-1">Industry leading</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-500 mb-2">{extendedStats.processingTime}s</div>
                        <div className="text-sm text-foreground/60">Avg Processing</div>
                        <div className="text-xs text-blue-500 mt-1">Lightning fast</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-violet-500 mb-2">${extendedStats.avgLoanSize.toLocaleString()}</div>
                        <div className="text-sm text-foreground/60">Avg Loan Size</div>
                        <div className="text-xs text-violet-500 mt-1">Perfect range</div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-background border border-border/40 rounded-xl p-6"
                            whileHover={{ y: -4, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold">{testimonial.name}</div>
                                    <div className="text-sm text-foreground/60">{testimonial.role}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                            </div>

                            <p className="text-foreground/70 mb-4 italic">"{testimonial.content}"</p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="text-emerald-500 font-semibold">{testimonial.loanAmount}</div>
                                <div className="text-foreground/50">{testimonial.timeAgo}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-violet-500/5 to-blue-500/5 rounded-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-center mb-8">Security & Trust</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {securityFeatures.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    className="text-center"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                                    <p className="text-sm text-foreground/60 mb-2">{feature.description}</p>
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-medium rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        {feature.status}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
