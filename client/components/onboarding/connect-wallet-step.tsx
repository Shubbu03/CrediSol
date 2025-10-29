"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowRight, Shield, Zap } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function ConnectWalletStep() {
    const { connected, connecting } = useWallet();

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
            className="text-center"
        >
            <motion.div
                variants={itemVariants}
                className="mb-6 flex justify-center"
            >
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                        <Wallet className="w-10 h-10 text-violet-600" />
                    </div>
                    {connected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-trust-green rounded-full flex items-center justify-center"
                        >
                            <Shield className="w-3 h-3 text-white" />
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold mb-4"
            >
                {connected ? "Wallet Connected!" : "Connect Your Wallet"}
            </motion.h2>

            <motion.p
                variants={itemVariants}
                className="text-foreground/70 mb-8 leading-relaxed"
            >
                {connected
                    ? "Great! Your wallet is connected and ready to use."
<<<<<<< Updated upstream
                    : "Connect your Solana wallet to get started with CrediSol. We support Phantom, Solflare, and other popular wallets."}
=======
                    : "Connect your Solana wallet to get started with CrediSOL. We support Phantom, Solflare, and other popular wallets."}
>>>>>>> Stashed changes
            </motion.p>

            <motion.div
                variants={itemVariants}
                className="mb-8"
            >
                {!connected ? (
                    <div className="space-y-4">
                        <WalletMultiButton className="!w-full !h-12 !bg-gradient-to-r !from-violet-600 !to-blue-600 !text-white !font-semibold !rounded-lg hover:!shadow-xl hover:!shadow-violet-500/30 !transition-all !duration-300" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-trust-green/10 border border-trust-green/20 rounded-lg"
                    >
                        <div className="flex items-center justify-center gap-2 text-trust-green font-medium">
                            <Shield className="w-5 h-5" />
                            <span>Wallet Successfully Connected</span>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {connected && (
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-center gap-2 text-sm text-foreground/60"
                >
                    <span>Proceeding to role selection...</span>
                    <ArrowRight className="w-4 h-4" />
                </motion.div>
            )}

            <motion.div
                variants={itemVariants}
                className="mt-8 p-4 bg-surface-1 rounded-lg border border-border/30"
            >
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-trust-green mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                        <div className="text-sm font-medium mb-1">Your Security Matters</div>
                        <div className="text-xs text-foreground/60">
                            We never store your private keys. Your wallet connection is secure and only used for transaction signing.
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
