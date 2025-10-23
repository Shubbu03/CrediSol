import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { ScoreAttestorService } from '../../../lib/score-attestor/service';

// This would be stored securely in production (e.g., environment variables)
const ATTESTOR_PRIVATE_KEY = process.env.ATTESTOR_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

export async function POST(request: NextRequest) {
    try {
        const { subject, loan, expiryHours = 24 } = await request.json();

        if (!subject || !loan) {
            return NextResponse.json(
                { error: 'Subject and loan addresses are required' },
                { status: 400 }
            );
        }

        // Initialize service with secure private key
        const service = new ScoreAttestorService(ATTESTOR_PRIVATE_KEY);

        // Create score attestation
        const attestationData = await service.createScoreAttestation(
            new PublicKey(subject),
            new PublicKey(loan),
            expiryHours
        );

        return NextResponse.json({
            success: true,
            attestationData: {
                score: attestationData.score,
                grade: attestationData.grade,
                pdBps: attestationData.pdBps,
                recommendedMinCollateralBps: attestationData.recommendedMinCollateralBps,
                expiryTs: attestationData.expiryTs,
                message: Array.from(attestationData.message),
                signature: Array.from(attestationData.signature),
                recoveryId: attestationData.recoveryId,
            },
            attestorPublicKey: service.getAttestorPublicKey().toBase58(),
            secp256k1PublicKey: Array.from(service.getSecp256k1PublicKey()),
        });

    } catch (error) {
        console.error('Score attestation API error:', error);
        return NextResponse.json(
            { error: 'Failed to create score attestation' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const loan = searchParams.get('loan');

        if (!subject || !loan) {
            return NextResponse.json(
                { error: 'Subject and loan addresses are required' },
                { status: 400 }
            );
        }

        // Initialize service
        const service = new ScoreAttestorService(ATTESTOR_PRIVATE_KEY);

        // Fetch score from Vettor API
        const vettorData = await service.fetchVettorScore(subject);

        return NextResponse.json({
            success: true,
            score: vettorData.totalScore,
            grade: service.calculateGrade(vettorData.totalScore),
            pdBps: service.calculatePDBps(vettorData.totalScore),
            recommendedMinCollateralBps: service.calculateRecommendedCollateralBps(vettorData.totalScore),
        });

    } catch (error) {
        console.error('Score fetch API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch score' },
            { status: 500 }
        );
    }
}
