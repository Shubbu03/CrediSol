"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../hooks/use-user-role";
import { ConnectWalletStep } from "../../components/onboarding/connect-wallet-step";
import { ChooseRoleStep } from "../../components/onboarding/choose-role-step";
import { CompleteStep } from "../../components/onboarding/complete-step";
import { ProgressIndicator } from "../../components/onboarding/progress-indicator";

type OnboardingStep = "connect-wallet" | "choose-role" | "complete";

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("connect-wallet");
    const { connected } = useWallet();
    const { role, onboarded, setOnboarded, isLoading } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        if (connected && currentStep === "connect-wallet") {
            setCurrentStep("choose-role");
        }
    }, [connected, currentStep]);

    useEffect(() => {
        if (role && currentStep === "choose-role") {
            const timer = setTimeout(() => {
                setCurrentStep("complete");
            }, 900);
            return () => clearTimeout(timer);
        }
    }, [role, currentStep]);

    useEffect(() => {
        if (!isLoading && connected && role && onboarded) {
            const redirectPath = role === "borrower" ? "/dashboard/borrower" : "/dashboard/lender";
            router.push(redirectPath);
        }
    }, [isLoading, connected, role, onboarded, router]);

    const stepVariants = {
        enter: {
            x: 300,
            opacity: 0,
        },
        center: {
            x: 0,
            opacity: 1,
        },
        exit: {
            x: -300,
            opacity: 0,
        },
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case "connect-wallet":
                return <ConnectWalletStep />;
            case "choose-role":
                return <ChooseRoleStep />;
            case "complete":
                return <CompleteStep />;
            default:
                return <ConnectWalletStep />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col pt-20">

                <div className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-md">
                        <ProgressIndicator currentStep={currentStep} />

                        <div className="mt-8 relative overflow-visible">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    variants={stepVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    {renderCurrentStep()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
