"use client";

import { Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import loansMarketplaceIdl from './idl/loans_marketplace.json';
import scoreAttestorIdl from './idl/score_attestor.json';
import { useAnchorProvider } from './provider';

const LOANS_PROGRAM_ID = new PublicKey("BTH9yYvKRBZHXJAPuv724mCMiDcjcnCqef7rDdSZUJWf");
const SCORE_ATTESTOR_PROGRAM_ID = new PublicKey("4PqY9kbQzanngrw48sHdCiK44AdCmw2VrEx485JVf7Jo");
const PROGRAM_ID = LOANS_PROGRAM_ID;

export function useScoreAttestorProgram() {
    const provider = useAnchorProvider();
    if (!provider) return null;
    return new Program(scoreAttestorIdl as any, provider);
}

export function useScoreAttestorConfigPda() {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("score_config")],
        SCORE_ATTESTOR_PROGRAM_ID
    )[0];
}

export function useScoreAttestationPda(subject: PublicKey, loan: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("score_attestation"), subject.toBuffer(), loan.toBuffer()],
        SCORE_ATTESTOR_PROGRAM_ID
    )[0];
}

export function useLoansProgram() {
    const provider = useAnchorProvider();
    if (!provider) return null;
    return new Program(loansMarketplaceIdl as any, provider);
}

export function useConfigPda() {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        PROGRAM_ID
    )[0];
}

// Utility function to convert loan ID to little-endian bytes (like Rust's to_le_bytes())
function loanIdToLeBytes(loanId: number): Buffer {
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigUInt64LE(BigInt(loanId), 0);
    return buffer;
}

export function useLoanPda(borrower: PublicKey, loanId: number) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("loan"),
            borrower.toBuffer(),
            loanIdToLeBytes(loanId)
        ],
        PROGRAM_ID
    )[0];
}

export function useLoanSignerPda(borrower: PublicKey, loanId: number) {
    // Loan signer PDA is the same as loan PDA - it's the authority for the escrow ATA
    return useLoanPda(borrower, loanId);
}

export function useLenderSharePda(loanPda: PublicKey, lender: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("lender_share"), loanPda.toBuffer(), lender.toBuffer()],
        PROGRAM_ID
    )[0];
}

export { PROGRAM_ID, TOKEN_PROGRAM_ID, SystemProgram };
