"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, User, CheckCircle } from "lucide-react";
import { useUserRole } from "../../hooks/use-user-role";
import { useEffect } from "react";

export function ChooseRoleStep() {
    const { updateRole, role } = useUserRole();

    const handleRoleSelect = (selectedRole: "borrower" | "lender") => {
        updateRole(selectedRole);
    };

    useEffect(() => {
    }, [role]);

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

    const cardVariants = {
        rest: { scale: 1, y: 0 },
        hover: {
            scale: 1.02,
            y: -4,
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.98 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
        >
            <motion.div
                variants={itemVariants}
                className="mb-6 flex justify-center"
            >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-violet-600" />
                </div>
            </motion.div>

            <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold mb-4"
            >
                Choose Your Role
            </motion.h2>

            <motion.p
                variants={itemVariants}
                className="text-foreground/70 mb-8 leading-relaxed"
            >
                How would you like to use CrediSol? You can always change this later in your settings.
            </motion.p>

            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto px-4"
            >
                <motion.div
                    variants={cardVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleRoleSelect("borrower")}
                    className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[320px] flex flex-col justify-center
            ${role === "borrower"
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-border hover:border-violet-300 bg-surface-1"
                        }
          `}
                >
                    {role === "borrower" && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-trust-green rounded-full flex items-center justify-center"
                        >
                            <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                    )}

                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                            <ArrowRight className="w-6 h-6 text-violet-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Borrower</h3>
                        <p className="text-sm text-foreground/70 mb-4">
                            Get undercollateralized loans using your credit score
                        </p>
                        <div className="space-y-2 text-xs text-foreground/60">
                            <div>• Use your credit score as proof</div>
                            <div>• Keep your data private with ZK proofs</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={cardVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleRoleSelect("lender")}
                    className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[320px] flex flex-col justify-center
            ${role === "lender"
                            ? "border-trust-green bg-trust-green/10"
                            : "border-border hover:border-trust-green/50 bg-surface-1"
                        }
          `}
                >
                    {role === "lender" && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-trust-green rounded-full flex items-center justify-center"
                        >
                            <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                    )}

                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-trust-green/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-trust-green" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Lender</h3>
                        <p className="text-sm text-foreground/70 mb-4">
                            Earn high yields by lending to verified borrowers
                        </p>
                        <div className="space-y-2 text-xs text-foreground/60">
                            <div>• Lend to credit-verified borrowers</div>
                            <div>• Diversify your DeFi portfolio</div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {role && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm text-trust-green font-medium bg-trust-green/10 px-4 py-2 rounded-lg"
                >
                    <span>Great choice! Setting up your dashboard...</span>
                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <ArrowRight className="w-4 h-4" />
                    </motion.div>
                </motion.div>
            )}

            <motion.div
                variants={itemVariants}
                className="mt-8 p-4 bg-surface-1 rounded-lg border border-border/30"
            >
                <div className="text-sm font-medium mb-2">Why Choose CrediSol?</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-foreground/60">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-trust-green rounded-full"></div>
                        <span>Zero-knowledge privacy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <span>Undercollateralized loans</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>High yield opportunities</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
