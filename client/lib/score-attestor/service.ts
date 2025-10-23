"use client";

import { PublicKey, Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import * as secp256k1 from "secp256k1";
import * as sha3 from "js-sha3";
import { getCreditScore } from '../../app/actions/getCreditScore';

export interface ScoreAttestationData {
    score: number;
    grade: number;
    pdBps: number;
    recommendedMinCollateralBps: number;
    expiryTs: number;
    message: Uint8Array;
    signature: Uint8Array;
    recoveryId: number;
}

export class ScoreAttestorService {
    private attestorKeypair: Keypair;
    private secp256k1PrivateKey: Buffer;
    private secp256k1PublicKey: Uint8Array;

    constructor(attestorPrivateKey?: string) {
        // Use provided key or generate new one for development
        if (attestorPrivateKey) {
            // If a private key is provided, create a Solana keypair from it
            const privateKeyBytes = Buffer.from(attestorPrivateKey, 'hex');
            this.attestorKeypair = Keypair.fromSecretKey(privateKeyBytes);
        } else {
            // Generate a new Solana keypair for development
            this.attestorKeypair = Keypair.generate();
        }

        // For secp256k1 operations, we'll use the Solana keypair's private key
        this.secp256k1PrivateKey = Buffer.from(this.attestorKeypair.secretKey.slice(0, 32));
        const secp256k1PubKeyCompressed = secp256k1.publicKeyCreate(this.secp256k1PrivateKey);
        this.secp256k1PublicKey = secp256k1.publicKeyConvert(secp256k1PubKeyCompressed, false);
    }


    /**
     * Calculate grade from score
     */
    calculateGrade(score: number): number {
        if (score > 700) return 5;
        if (score > 500) return 4;
        if (score > 350) return 3;
        if (score > 200) return 2;
        return 1;
    }

    /**
     * Calculate probability of default in basis points
     */
    calculatePDBps(score: number): number {
        // Formula: max(50, min(5000, floor((850 - score) * 6)))
        return Math.max(50, Math.min(5000, Math.floor((850 - score) * 6)));
    }

    /**
     * Calculate recommended minimum collateral in basis points
     */
    calculateRecommendedCollateralBps(score: number): number {
        // Higher score = lower collateral requirement
        if (score > 700) return 500;  // 5%
        if (score > 500) return 1000; // 10%
        if (score > 350) return 1500; // 15%
        if (score > 200) return 2000; // 20%
        return 2500; // 25%
    }

    /**
     * Convert number to big-endian 64-bit buffer
     */
    private toBigUInt64BE(value: number | bigint): Buffer {
        const buf = Buffer.allocUnsafe(8);
        let bigValue = BigInt(value);

        // Write big-endian 64-bit integer manually for browser compatibility
        for (let i = 7; i >= 0; i--) {
            buf[i] = Number(bigValue & BigInt(0xFF));
            bigValue = bigValue >> BigInt(8);
        }
        return buf;
    }

    /**
     * Generate cryptographic signature for score attestation
     */
    generateScoreSignature(
        subject: PublicKey,
        score: number,
        timestamp: number
    ): { message: Uint8Array; signature: Uint8Array; recoveryId: number } {
        // Create message hash from: subject + score + timestamp
        const messageData = Buffer.concat([
            subject.toBuffer(),
            this.toBigUInt64BE(score),
            this.toBigUInt64BE(timestamp),
        ]);

        const messageHash = Buffer.from(sha3.keccak_256.digest(messageData));

        // Sign with attestor's private key
        const sigObj = secp256k1.ecdsaSign(messageHash, this.secp256k1PrivateKey);

        return {
            message: messageHash,
            signature: sigObj.signature,
            recoveryId: sigObj.recid,
        };
    }

    /**
     * Create complete score attestation data
     */
    async createScoreAttestation(
        subject: PublicKey,
        loan: PublicKey,
        expiryHours: number = 24
    ): Promise<ScoreAttestationData> {
        // Fetch AI score using the existing action
        const score = await getCreditScore(subject.toBase58());

        if (score === null) {
            throw new Error('Failed to fetch credit score');
        }

        // Calculate derived values
        const grade = this.calculateGrade(score);
        const pdBps = this.calculatePDBps(score);
        const recommendedMinCollateralBps = this.calculateRecommendedCollateralBps(score);

        // Calculate expiry timestamp
        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + (expiryHours * 3600);

        // Generate signature
        const { message, signature, recoveryId } = this.generateScoreSignature(
            subject,
            score,
            now
        );

        return {
            score,
            grade,
            pdBps,
            recommendedMinCollateralBps,
            expiryTs,
            message,
            signature,
            recoveryId,
        };
    }

    /**
     * Get the secp256k1 public key for config initialization
     */
    getSecp256k1PublicKey(): Uint8Array {
        return this.secp256k1PublicKey;
    }

    /**
     * Get the attestor public key
     */
    getAttestorPublicKey(): PublicKey {
        return this.attestorKeypair.publicKey;
    }

    /**
     * Get the attestor keypair (for signing transactions)
     */
    getAttestorKeypair(): Keypair {
        return this.attestorKeypair;
    }
}
