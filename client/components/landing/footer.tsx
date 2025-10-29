"use client";

import { motion } from "framer-motion";
import { Github, MessageCircle, X, ArrowRight, Shield, Zap, Lock } from "lucide-react";

export default function Footer() {
    const links = [
        { label: "GitHub", href: "https://github.com/zklend", icon: Github },
        { label: "Discord", href: "https://discord.gg/zklend", icon: MessageCircle },
        { label: "X", href: "https://x.com/zkmatrix", icon: X },
    ];

    const features = [
        { icon: Shield, text: "ZK Privacy" },
        { icon: Zap, text: "Solana Speed" },
        { icon: Lock, text: "Smart Contracts" }
    ];

    return (
        <footer className="relative border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 -z-10" />
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <motion.div
                                className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="text-white font-bold text-sm">zk</span>
                            </motion.div>
                            <span className="text-lg font-bold">CrediSol</span>
                        </div>
                        <p className="text-sm text-foreground/60 mb-4">
                            The future of DeFi lending. Access liquidity without barriers, powered by zero-knowledge proofs.
                        </p>
                        <div className="flex items-center gap-4">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-1 text-xs text-foreground/60"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon className="w-3 h-3" />
                                        {feature.text}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/app" className="text-foreground/60 hover:text-foreground transition-colors">Borrow</a></li>
                            <li><a href="/app" className="text-foreground/60 hover:text-foreground transition-colors">Lend</a></li>
                            <li><a href="/app" className="text-foreground/60 hover:text-foreground transition-colors">Dashboard</a></li>
                            <li><a href="/app" className="text-foreground/60 hover:text-foreground transition-colors">Analytics</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/docs" className="text-foreground/60 hover:text-foreground transition-colors">Documentation</a></li>
                            <li><a href="/blog" className="text-foreground/60 hover:text-foreground transition-colors">Blog</a></li>
                            <li><a href="/guides" className="text-foreground/60 hover:text-foreground transition-colors">Guides</a></li>
                            <li><a href="/api" className="text-foreground/60 hover:text-foreground transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Community</h4>
                        <div className="flex flex-col gap-3">
                            {links.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <motion.a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                        <ArrowRight className="w-3 h-3 ml-auto" />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/20 pt-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-xs text-foreground/40">
                            <span>© 2025 CrediSol Labs. All rights reserved.</span>
                            <a href="/privacy" className="hover:text-foreground/60 transition-colors">Privacy</a>
                            <a href="/terms" className="hover:text-foreground/60 transition-colors">Terms</a>
                        </div>

                        <motion.div
                            className="flex items-center gap-2 text-xs text-foreground/40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span>All systems operational</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
