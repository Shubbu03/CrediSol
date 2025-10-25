"use client";

import { Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import loansMarketplaceIdl from './idl/loans_marketplace.json';
import scoreAttestorIdl from './idl/score_attestor.json';
import { useAnchorProvider } from './provider';

const LOANS_PROGRAM_ID = new PublicKey("5CsJHgdh6jtKRVJiJL4bBpTeUcUFV3B9gphEccyvGQmS");
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
function loanIdToLeBytes(loanId: string | number): Buffer {
    const buffer = Buffer.allocUnsafe(8);
    const value = BigInt(loanId);

    // Write 64-bit little-endian integer manually
    for (let i = 0; i < 8; i++) {
        buffer[i] = Number((value >> BigInt(i * 8)) & BigInt(0xFF));
    }

    return buffer;
}

export function useLoanPda(borrower: PublicKey, loanId: string | number) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("loan"),
            borrower.toBuffer(),
            loanIdToLeBytes(loanId)
        ],
        PROGRAM_ID
    )[0];
}

export function useLoanSignerPda(borrower: PublicKey, loanId: string | number) {
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
