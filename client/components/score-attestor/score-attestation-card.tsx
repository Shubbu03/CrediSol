"use client";

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Shield, AlertTriangle } from "lucide-react";
import { useScoreAttestor } from "../../hooks/use-score-attestor";
import { useWallet } from '@solana/wallet-adapter-react';

interface ScoreAttestationCardProps {
    onAttestationComplete?: (scoreData: any) => void;
    loanId?: string;
}

export function ScoreAttestationCard({ onAttestationComplete, loanId }: ScoreAttestationCardProps) {
    const { publicKey } = useWallet();
    const { postScoreAttestation, isLoading, error } = useScoreAttestor();
    const [attestationStatus, setAttestationStatus] = useState<'idle' | 'attesting' | 'success' | 'error'>('idle');
    const [attestationData, setAttestationData] = useState<any>(null);

    const handleAttestation = async () => {
        if (!publicKey) return;

        setAttestationStatus('attesting');

        try {
            // For now, we'll use a placeholder loan ID if none provided
            const loanPubkey = loanId ? new PublicKey(loanId) : PublicKey.default;

            const result = await postScoreAttestation(publicKey, loanPubkey, 24);

            setAttestationData(result.attestationData);
            setAttestationStatus('success');

            if (onAttestationComplete) {
                onAttestationComplete(result.attestationData);
            }
        } catch (err) {
            console.error('Score attestation failed:', err);
            setAttestationStatus('error');
        }
    };

    const getStatusIcon = () => {
        switch (attestationStatus) {
            case 'attesting':
                return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />;
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
            case 'error':
                return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default:
                return <Shield className="w-5 h-5 text-violet-400" />;
        }
    };

    const getStatusText = () => {
        switch (attestationStatus) {
            case 'attesting':
                return 'Attesting Score...';
            case 'success':
                return 'Score Attested';
            case 'error':
                return 'Attestation Failed';
            default:
                return 'Attest Credit Score';
        }
    };

    const getStatusDescription = () => {
        switch (attestationStatus) {
            case 'attesting':
                return 'Generating cryptographic proof of your credit score...';
            case 'success':
                return `Score ${attestationData?.score} attested with grade ${attestationData?.grade}`;
            case 'error':
                return 'An error occurred. Please try again later.';
            default:
                return 'Securely attest your credit score to the blockchain for lenders to verify.';
        }
    };

    const isClickable = attestationStatus === 'idle' || attestationStatus === 'error';
    const isSuccess = attestationStatus === 'success';

    return (
        <motion.div
            whileHover={isClickable ? { scale: 1.03, y: -3, boxShadow: "0 8px 24px rgba(128, 90, 250, 0.3)" } : {}}
            whileTap={isClickable ? { scale: 0.98 } : {}}
            onClick={isClickable ? handleAttestation : undefined}
            className={`w-full p-6 rounded-xl text-left border transition-all text-foreground backdrop-blur-md ${isSuccess
                ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-green-500/10 cursor-default'
                : isClickable
                    ? 'border-border/30 bg-gradient-to-br from-violet-500/5 to-blue-500/5 hover:from-violet-500/10 hover:to-blue-500/10 cursor-pointer'
                    : 'border-border/30 bg-gradient-to-br from-violet-500/5 to-blue-500/5 cursor-default'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon()}
                        <span className="font-semibold text-foreground">
                            {getStatusText()}
                        </span>
                    </div>
                    <p className="text-sm text-foreground/70">
                        {getStatusDescription()}
                    </p>
                    {attestationData && (
                        <div className="mt-3 flex gap-4 text-xs">
                            <div className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded">
                                Score: {attestationData.score}
                            </div>
                            <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                Grade: {attestationData.grade}
                            </div>
                            <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                                PD: {attestationData.pdBps}bps
                            </div>
                        </div>
                    )}
                </div>
                {isSuccess && (
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                            Verified
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
