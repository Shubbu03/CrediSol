"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { useUserRole } from "../../hooks/use-user-role";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompleteStep() {
    const { role, setOnboarded } = useUserRole();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleContinue = () => {
        setIsRedirecting(true);
        setOnboarded(true);
        const redirectPath = role === "borrower" ? "/dashboard/borrower" : "/dashboard/lender";
        router.push(redirectPath);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center overflow-visible"
        >
            <motion.div
                variants={itemVariants}
                className="mb-8 flex justify-center overflow-visible"
            >
                <div className="relative">
                    <motion.div
                        className="w-28 h-28 rounded-full bg-gradient-to-br from-trust-green/20 to-emerald-500/20 flex items-center justify-center"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut" as const,
                        }}
                    >
                        <CheckCircle className="w-14 h-14 text-trust-green" />
                    </motion.div>
                </div>
            </motion.div>

            <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold mb-4"
            >
                All Set! 🎉
            </motion.h2>

            <motion.p
                variants={itemVariants}
                className="text-foreground/70 mb-8 leading-relaxed"
            >
                Welcome to CrediSOL! You're now ready to {role === "borrower" ? "start borrowing" : "start lending"} with zero-knowledge privacy.
            </motion.p>

            <motion.div
                variants={itemVariants}
                className="mb-8 p-6 bg-surface-1 rounded-xl border border-border/30"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    {role === "borrower" ? (
                        <>
                            <span className="text-lg font-semibold">Borrower Dashboard</span>
                        </>
                    ) : (
                        <>
                            <span className="text-lg font-semibold">Lender Dashboard</span>
                        </>
                    )}
                </div>

                <div className="text-sm text-foreground/70">
                    {role === "borrower" ? (
                        <>
                            <p className="mb-2 text-left font-semibold">You can now:</p>
                            <ul className="text-left space-y-1">
                                <li>• Apply for undercollateralized loans</li>
                                <li>• View your credit score attestations</li>
                                <li>• Manage your active loans</li>
                                <li>• Track your borrowing history</li>
                            </ul>
                        </>
                    ) : (
                        <>
                            <p className="mb-2 text-left font-semibold">You can now:</p>
                            <ul className="text-left space-y-1">
                                <li>• Browse available lending opportunities</li>
                                <li>• Fund loans and earn high yields</li>
                                <li>• Track your lending portfolio</li>
                                <li>• Monitor your returns</li>
                            </ul>
                        </>
                    )}
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="mb-8"
            >
                <motion.button
                    onClick={handleContinue}
                    disabled={isRedirecting}
                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isRedirecting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Redirecting...</span>
                        </>
                    ) : (
                        <>
                            <span>Continue to Dashboard</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="p-4 bg-surface-1 rounded-lg border border-border/30"
            >
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-trust-green mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                        <div className="text-sm font-medium mb-1">You're All Set!</div>
                        <div className="text-xs text-foreground/60">
                            Your account is secure and ready to use. Remember to keep your wallet safe and never share your private keys.
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
