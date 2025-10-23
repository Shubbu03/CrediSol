"use client";

import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { ScoreAttestorService, ScoreAttestationData } from '../lib/score-attestor/service';
import { useScoreAttestorProgram } from '../lib/solana/program';
import { notify } from '../lib/notify';

export function useScoreAttestor() {
    const program = useScoreAttestorProgram();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const service = new ScoreAttestorService();

    const postScoreAttestation = useCallback(async (
        subject: PublicKey,
        loan: PublicKey,
        expiryHours: number = 24
    ) => {
        if (!program) {
            throw new Error('Score attestor program not available');
        }

        setIsLoading(true);
        setError(null);

        try {
            // Create score attestation data
            const attestationData = await service.createScoreAttestation(
                subject,
                loan,
                expiryHours
            );

            // Get PDAs
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("score_config")],
                program.programId
            );

            const [scorePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("score"), subject.toBuffer(), loan.toBuffer()],
                program.programId
            );

            // Post score attestation to blockchain
            const tx = await program.methods
                .postScoreAttestation(
                    attestationData.score,
                    attestationData.grade,
                    attestationData.pdBps,
                    attestationData.recommendedMinCollateralBps,
                    new BN(attestationData.expiryTs),
                    Array.from(attestationData.message),
                    Array.from(attestationData.signature),
                    attestationData.recoveryId
                )
                .accountsStrict({
                    config: configPda,
                    subject,
                    loan,
                    attestor: service.getAttestorPublicKey(),
                    score: scorePda,
                    systemProgram: SystemProgram.programId,
                })
                .signers([service.getAttestorKeypair()])
                .rpc();

            notify({ description: 'Score attestation posted successfully!', type: 'success' });
            return { tx, scorePda, attestationData };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError('An error occurred. Please try again later.');
            notify({ description: 'An error occurred. Please try again later.', type: 'error' });
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, service]);

    const initializeConfig = useCallback(async (admin: PublicKey) => {
        if (!program) {
            throw new Error('Score attestor program not available');
        }

        setIsLoading(true);
        setError(null);

        try {
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("score_config")],
                program.programId
            );

            const tx = await program.methods
                .initializeConfig(
                    service.getAttestorPublicKey(),
                    Array.from(service.getSecp256k1PublicKey())
                )
                .accountsStrict({
                    config: configPda,
                    admin,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            notify({ description: 'Score attestor config initialized!', type: 'success' });
            return { tx, configPda };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError('An error occurred. Please try again later.');
            notify({ description: 'An error occurred. Please try again later.', type: 'error' });
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, service]);

    const fetchScoreAttestation = useCallback(async (
        subject: PublicKey,
        loan: PublicKey
    ) => {
        if (!program) {
            throw new Error('Score attestor program not available');
        }

        try {
            const [scorePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("score"), subject.toBuffer(), loan.toBuffer()],
                program.programId
            );

            const scoreAttestation = await (program.account as any).scoreAttestation.fetch(scorePda);
            return {
                score: scoreAttestation.score,
                grade: scoreAttestation.grade,
                pdBps: scoreAttestation.pdBps,
                recommendedMinCollateralBps: scoreAttestation.recommendedMinCollateralBps,
                attestor: scoreAttestation.attestor,
                postedAt: scoreAttestation.postedAt.toNumber(),
                expiryTs: scoreAttestation.expiryTs.toNumber(),
                revoked: scoreAttestation.revoked,
            };
        } catch (err) {
            return null;
        }
    }, [program]);

    return {
        postScoreAttestation,
        initializeConfig,
        fetchScoreAttestation,
        isLoading,
        error,
        attestorPublicKey: service.getAttestorPublicKey(),
    };
}
