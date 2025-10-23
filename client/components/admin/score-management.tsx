"use client";

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Shield, AlertTriangle } from "lucide-react";
import { useScoreAttestor } from '../../hooks/use-score-attestor';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '../../lib/notify';

interface AdminScoreManagementProps {
    className?: string;
}

export function AdminScoreManagement({ className = "" }: AdminScoreManagementProps) {
    const { publicKey } = useWallet();
    const { initializeConfig, isLoading, error } = useScoreAttestor();
    const [configInitialized, setConfigInitialized] = useState(false);

    const handleInitializeConfig = async () => {
        if (!publicKey) {
            notify('Please connect your wallet', 'error');
            return;
        }

        try {
            await initializeConfig(publicKey);
            setConfigInitialized(true);
            notify('Score attestor config initialized successfully!', 'success');
        } catch (err) {
            console.error('Failed to initialize config:', err);
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="bg-surface-1 rounded-xl border border-border/30 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-400" />
                    Score Attestor Configuration
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="flex items-center gap-3">
                            {configInitialized ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            )}
                            <div>
                                <div className="font-medium text-foreground">
                                    {configInitialized ? 'Config Initialized' : 'Config Not Initialized'}
                                </div>
                                <div className="text-sm text-foreground/70">
                                    {configInitialized
                                        ? 'Score attestor is ready to accept attestations'
                                        : 'Initialize the score attestor configuration'
                                    }
                                </div>
                            </div>
                        </div>

                        {!configInitialized && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleInitializeConfig}
                                disabled={isLoading}
                                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Initializing...' : 'Initialize'}
                            </motion.button>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-red-400">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Error</span>
                            </div>
                            <p className="text-sm text-red-300 mt-1">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-surface-1 rounded-xl border border-border/30 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Score Management Actions
                </h3>

                <div className="space-y-3">
                    <div className="p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="font-medium text-foreground mb-2">Revoke Score Attestation</div>
                        <p className="text-sm text-foreground/70 mb-3">
                            Revoke a specific score attestation if it's found to be invalid or fraudulent.
                        </p>
                        <button
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                            disabled
                        >
                            Coming Soon
                        </button>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="font-medium text-foreground mb-2">Update Score Expiry</div>
                        <p className="text-sm text-foreground/70 mb-3">
                            Extend or reduce the expiry time for a specific score attestation.
                        </p>
                        <button
                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium rounded-lg transition-colors"
                            disabled
                        >
                            Coming Soon
                        </button>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="font-medium text-foreground mb-2">Pause Score Attestations</div>
                        <p className="text-sm text-foreground/70 mb-3">
                            Temporarily pause all new score attestations for maintenance.
                        </p>
                        <button
                            className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
                            disabled
                        >
                            Coming Soon
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-surface-1 rounded-xl border border-border/30 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="text-sm text-foreground/70 mb-1">Attestor Status</div>
                        <div className="font-medium text-emerald-400">Active</div>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="text-sm text-foreground/70 mb-1">Signature Verification</div>
                        <div className="font-medium text-emerald-400">Enabled</div>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="text-sm text-foreground/70 mb-1">Score Expiry Check</div>
                        <div className="font-medium text-emerald-400">Active</div>
                    </div>

                    <div className="p-4 bg-background/50 rounded-lg border border-border/20">
                        <div className="text-sm text-foreground/70 mb-1">Revocation Check</div>
                        <div className="font-medium text-emerald-400">Active</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
