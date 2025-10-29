"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    DollarSign,
    RefreshCw,
    Wallet,
    Shield,
    TrendingUp,
    ArrowRight,
    Clock,
    CheckCircle,
    Users,
    Zap
} from "lucide-react";
import { useState } from "react";

export default function HowItWorks() {
    const [activeRole, setActiveRole] = useState<'borrower' | 'lender'>('borrower');
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const borrowerSteps = [
        {
            number: 1,
            icon: Wallet,
            title: "Connect Wallet",
<<<<<<< Updated upstream
            description: "Link your Solana wallet to access CrediSol",
=======
            description: "Link your Solana wallet to access CrediSOL",
>>>>>>> Stashed changes
            details: [
                "Connect Phantom, Solflare, or other Solana wallets",
                "No KYC or personal information required",
                "Instant wallet verification"
            ],
            color: "from-violet-500 to-blue-500",
            bgColor: "bg-violet-500/10"
        },
        {
            number: 2,
            icon: Shield,
            title: "Generate ZK Proof",
            description: "Prove your creditworthiness privately",
            details: [
                "Upload financial documents securely",
                "ZK proof generated on your device",
                "No data leaves your computer"
            ],
            color: "from-blue-500 to-emerald-500",
            bgColor: "bg-blue-500/10"
        },
        {
            number: 3,
            icon: DollarSign,
            title: "Request Loan",
            description: "Apply for undercollateralized loan",
            details: [
                "Specify loan amount and terms",
                "Instant approval based on ZK proof",
                "Funds transferred to your wallet"
            ],
            color: "from-emerald-500 to-violet-500",
            bgColor: "bg-emerald-500/10"
        }
    ];

    const lenderSteps = [
        {
            number: 1,
            icon: Wallet,
            title: "Connect Wallet",
            description: "Link your Solana wallet to start lending",
            details: [
                "Connect Phantom, Solflare, or other Solana wallets",
                "No KYC or personal information required",
                "Instant wallet verification"
            ],
            color: "from-violet-500 to-blue-500",
            bgColor: "bg-violet-500/10"
        },
        {
            number: 2,
            icon: TrendingUp,
            title: "Fund Loan Pool",
            description: "Deposit funds to earn yield",
            details: [
                "Choose loan terms and risk level",
                "Deposit SOL or USDC",
                "Start earning APY immediately"
            ],
            color: "from-blue-500 to-emerald-500",
            bgColor: "bg-blue-500/10"
        },
        {
            number: 3,
            icon: RefreshCw,
            title: "Earn & Reinvest",
            description: "Collect interest and manage portfolio",
            details: [
                "Automatic interest payments",
                "Reinvest or withdraw anytime",
                "Track performance dashboard"
            ],
            color: "from-emerald-500 to-violet-500",
            bgColor: "bg-emerald-500/10"
        }
    ];

    const currentSteps = activeRole === 'borrower' ? borrowerSteps : lenderSteps;

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
            id="how-it-works"
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
                        How It Works
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
                        Choose your role and see the step-by-step process
                    </p>

                    <div className="flex justify-center">
                        <div className="bg-muted/50 rounded-lg p-1 flex">
                            <button
                                onClick={() => setActiveRole('borrower')}
                                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${activeRole === 'borrower'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-foreground/60 hover:text-foreground'
                                    }`}
                            >
                                <User className="w-4 h-4 inline mr-2" />
                                Borrowers
                            </button>
                            <button
                                onClick={() => setActiveRole('lender')}
                                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${activeRole === 'lender'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-foreground/60 hover:text-foreground'
                                    }`}
                            >
                                <TrendingUp className="w-4 h-4 inline mr-2" />
                                Lenders
                            </button>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeRole}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="hidden md:block absolute top-8 left-0 right-0 h-1 z-0">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-emerald-500/30"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            />
                        </div>

                        {currentSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isHovered = hoveredStep === index;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative group"
                                    onMouseEnter={() => setHoveredStep(index)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                >
                                    <motion.div
                                        className="hidden md:flex absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full items-center justify-center border-4 border-background shadow-lg z-10"
                                        style={{
                                            background: step.color.includes('violet')
                                                ? 'linear-gradient(135deg, #7c3aed, #3b82f6)'
                                                : step.color.includes('blue')
                                                    ? 'linear-gradient(135deg, #3b82f6, #10b981)'
                                                    : 'linear-gradient(135deg, #10b981, #7c3aed)'
                                        }}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </motion.div>

                                    <div className="md:hidden mb-4 flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                            style={{
                                                background: step.color.includes('violet')
                                                    ? 'linear-gradient(135deg, #7c3aed, #3b82f6)'
                                                    : step.color.includes('blue')
                                                        ? 'linear-gradient(135deg, #3b82f6, #10b981)'
                                                        : 'linear-gradient(135deg, #10b981, #7c3aed)'
                                            }}
                                        >
                                            {step.number}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{step.title}</h3>
                                        </div>
                                    </div>

                                    <div className="md:pt-16">
                                        <motion.div
                                            className={`bg-background border border-border/40 rounded-xl p-6 transition-all duration-300 ${isHovered ? 'shadow-xl shadow-violet-500/10 border-violet-500/30' : ''
                                                }`}
                                            whileHover={{ y: -4 }}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-semibold hidden md:block">
                                                    {step.title}
                                                </h3>
                                                {isHovered && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-2 h-2 bg-emerald-500 rounded-full hidden md:block"
                                                    />
                                                )}
                                            </div>

                                            <p className="text-foreground/60 leading-relaxed mb-4">
                                                {step.description}
                                            </p>

                                            <AnimatePresence>
                                                {isHovered && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t border-border/20 pt-4">
                                                            <ul className="space-y-2">
                                                                {step.details.map((detail, detailIndex) => (
                                                                    <motion.li
                                                                        key={detailIndex}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: detailIndex * 0.1 }}
                                                                        className="flex items-center gap-2 text-sm text-foreground/70"
                                                                    >
                                                                        <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                                                        {detail}
                                                                    </motion.li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center mt-16"
                >
                    <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">
                            Ready to {activeRole === 'borrower' ? 'borrow' : 'lend'}?
                        </h3>
                        <p className="text-foreground/60 mb-6">
                            {activeRole === 'borrower'
                                ? 'Get instant access to liquidity with minimal collateral'
                                : 'Start earning yield on your idle assets'
                            }
                        </p>
                        <motion.a
                            href="/app"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
