"use client";

import { motion } from "framer-motion";
import { Check, Wallet, User, CheckCircle } from "lucide-react";

type OnboardingStep = "connect-wallet" | "choose-role" | "complete";

interface ProgressIndicatorProps {
    currentStep: OnboardingStep;
}

const steps = [
    {
        id: "connect-wallet" as const,
        label: "Connect Wallet",
        icon: Wallet,
    },
    {
        id: "choose-role" as const,
        label: "Choose Role",
        icon: User,
    },
    {
        id: "complete" as const,
        label: "Complete",
        icon: CheckCircle,
    },
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
    const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = step.id === currentStep;
                    const isUpcoming = index > currentStepIndex;

                    return (
                        <div key={step.id} className="flex items-center shrink-0">
                            <motion.div
                                className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0
                                    ${isCompleted
                                        ? "bg-trust-green text-white"
                                        : isCurrent
                                            ? "bg-violet-600 text-white"
                                            : "bg-muted text-foreground/50"
                                    }`}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </motion.div>

                            <motion.div
                                className={`ml-2 text-sm font-medium ${isCompleted || isCurrent
                                        ? "text-foreground"
                                        : "text-foreground/50"
                                    }`}
                                animate={{
                                    opacity: isCompleted || isCurrent ? 1 : 0.5,
                                }}
                            >
                                {step.label}
                            </motion.div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-4 h-0.5 bg-muted relative">
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-trust-green"
                                        initial={{ width: "0%" }}
                                        animate={{
                                            width: index < currentStepIndex ? "100%" : "0%",
                                        }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
