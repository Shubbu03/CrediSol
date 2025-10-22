import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const loanFormSchema = z.object({
    amount: z.number().min(100, "Minimum loan amount is 100 USDC"),
    termMonths: z.number().min(1).max(36, "Maximum term is 36 months"),
    maxAprBps: z.number().min(100).max(5000, "APR must be between 1% and 50%"),
    minCollateralBps: z.number().min(1000).max(5000, "Collateral must be between 10% and 50%"),
    fundingDeadlineDays: z.number().min(1).max(30, "Funding deadline must be between 1 and 30 days"),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

interface CreateLoanFormProps {
    isVerified: boolean;
    creditScore: number;
}

export function CreateLoanForm({ isVerified, creditScore }: CreateLoanFormProps) {
    const { publicKey } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<LoanFormValues>({
        resolver: zodResolver(loanFormSchema),
        defaultValues: {
            amount: 1000,
            termMonths: 6,
            maxAprBps: 2000,
            minCollateralBps: 2000,
            fundingDeadlineDays: 7,
        },
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

    const amount = watch("amount");
    const termMonths = watch("termMonths");
    const maxAprBps = watch("maxAprBps");
    const minCollateralBps = watch("minCollateralBps");
    const fundingDeadlineDays = watch("fundingDeadlineDays");

    const estimatedInterest = Math.round((amount * (maxAprBps / 10000) * termMonths) / 12);
    const totalRepayment = amount + estimatedInterest;
    const requiredCollateral = Math.round((amount * minCollateralBps) / 10000);

    const onSubmit = async (data: LoanFormValues) => {
        if (!publicKey) {
            console.error('Wallet not connected');
            return;
        }

        if (!isVerified) {
            console.error('Verification required');
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('Creating loan with data:', data);

            await Promise.race([
                new Promise((resolve) => setTimeout(resolve, 1500)),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 10000)
                )
            ]);

        } catch (error) {
            console.error('Error creating loan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
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
        <div className="min-h-screen bg-background">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-trust-green/10 to-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Create New Loan Request</h1>
                            <p className="text-foreground/70">
                                Fill in the details below to create a new loan request for lenders to fund.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <div className="p-6 bg-surface-1 rounded-xl border border-border/30">
                                <div className="mb-6">
                                    <div className="p-4 bg-trust-green/10 border border-trust-green/20 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                <svg className="w-5 h-5 text-trust-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-trust-green">Your Credit Score: {creditScore}</h3>
                                                <p className="text-sm text-foreground/70 mt-1">
                                                    {creditScore > 700 ? 'Excellent' : creditScore > 600 ? 'Good' : 'Fair'} credit rating
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {!isVerified && (
                                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-foreground/90">
                                                        Please complete all verification steps before submitting a loan request.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground/90 mb-2">
                                            Loan Amount (USDC)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-surface-2 border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-trust-green/20 focus:border-trust-green/50 transition-colors"
                                            {...register("amount", { valueAsNumber: true })}
                                        />
                                        {errors.amount && (
                                            <p className="mt-1.5 text-sm text-red-400">{errors.amount.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground/90 mb-2">
                                            Loan Term: <span className="text-trust-green">{termMonths} {termMonths === 1 ? "month" : "months"}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={36}
                                            step={1}
                                            value={termMonths}
                                            onChange={(e) => setValue("termMonths", Number(e.target.value))}
                                            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-trust-green"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${(termMonths / 36) * 100}%, #2a2a2a ${(termMonths / 36) * 100}%, #2a2a2a 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-foreground/50 mt-1.5">
                                            <span>1 month</span>
                                            <span>36 months</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground/90 mb-2">
                                            Max APR: <span className="text-trust-green">{(maxAprBps / 100).toFixed(2)}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min={100}
                                            max={5000}
                                            step={25}
                                            value={maxAprBps}
                                            onChange={(e) => setValue("maxAprBps", Number(e.target.value))}
                                            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((maxAprBps - 100) / 4900) * 100}%, #2a2a2a ${((maxAprBps - 100) / 4900) * 100}%, #2a2a2a 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-foreground/50 mt-1.5">
                                            <span>1%</span>
                                            <span>50%</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground/90 mb-2">
                                            Min Collateral: <span className="text-trust-green">{minCollateralBps / 100}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min={1000}
                                            max={5000}
                                            step={100}
                                            value={minCollateralBps}
                                            onChange={(e) => setValue("minCollateralBps", Number(e.target.value))}
                                            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((minCollateralBps - 1000) / 4000) * 100}%, #2a2a2a ${((minCollateralBps - 1000) / 4000) * 100}%, #2a2a2a 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-foreground/50 mt-1.5">
                                            <span>10%</span>
                                            <span>50%</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground/90 mb-2">
                                            Funding Deadline: <span className="text-trust-green">{fundingDeadlineDays} {fundingDeadlineDays === 1 ? 'day' : 'days'}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={30}
                                            step={1}
                                            value={fundingDeadlineDays}
                                            onChange={(e) => setValue("fundingDeadlineDays", Number(e.target.value))}
                                            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((fundingDeadlineDays - 1) / 29) * 100}%, #2a2a2a ${((fundingDeadlineDays - 1) / 29) * 100}%, #2a2a2a 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-foreground/50 mt-1.5">
                                            <span>1 day</span>
                                            <span>30 days</span>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-surface-2 border border-border/30 rounded-lg space-y-3">
                                        <h3 className="text-sm font-semibold text-foreground/90 mb-3">Loan Summary</h3>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-foreground/70">Estimated Interest</span>
                                            <span className="font-semibold text-foreground">${estimatedInterest.toLocaleString()} USDC</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-t border-border/20">
                                            <span className="text-sm text-foreground/70">Total Repayment</span>
                                            <span className="font-semibold text-trust-green text-lg">${totalRepayment.toLocaleString()} USDC</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-t border-border/20">
                                            <span className="text-sm text-foreground/70">Required Collateral</span>
                                            <span className="font-semibold text-foreground">${requiredCollateral.toLocaleString()} USDC</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isVerified}
                                            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isSubmitting
                                                    ? 'bg-trust-green/50 cursor-not-allowed text-foreground/50'
                                                    : !isVerified
                                                        ? 'bg-surface-2 border border-border/30 cursor-not-allowed text-foreground/50'
                                                        : 'bg-trust-green hover:bg-trust-green/90 text-white shadow-lg shadow-trust-green/20 hover:shadow-trust-green/30'
                                                }`}
                                        >
                                            {!isVerified
                                                ? 'Complete Verification First'
                                                : isSubmitting
                                                    ? 'Creating Loan Request...'
                                                    : 'Create Loan Request'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
