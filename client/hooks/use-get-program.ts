import { Program, AnchorProvider, setProvider, type Idl, Wallet } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { connection } from "../lib/solana/connection";
import type { AttestationRegistry } from "../lib/program/types/attestation_registry";
import attestationRegistryIdl from "../lib/program/idl/attestation_registry.json";
import type { LoansMarketplace } from "../lib/program/types/loans_marketplace";
import loansMarketplaceIdl from "../lib/program/idl/loans_marketplace.json";
import type { ScoreAttestor } from "../lib/program/types/score_attestor";
import scoreAttestorIdl from "../lib/program/idl/score_attestor.json";

// Constants
const LOANS_PROGRAM_ID = new PublicKey("5CsJHgdh6jtKRVJiJL4bBpTeUcUFV3B9gphEccyvGQmS");
const SCORE_ATTESTOR_PROGRAM_ID = new PublicKey("4PqY9kbQzanngrw48sHdCiK44AdCmw2VrEx485JVf7Jo");

// Global program instances to prevent multiple RPC calls
let loansProgramInstance: Program<LoansMarketplace> | null = null;
let scoreAttestorProgramInstance: Program<ScoreAttestor> | null = null;
let attestationRegistryProgramInstance: Program<AttestationRegistry> | null = null;

export const useLoansMarketplaceProgram = () => {
    const { wallet, signTransaction, signAllTransactions, publicKey } = useWallet();

    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) return null;

    // Return cached instance if available
    if (loansProgramInstance) {
        return loansProgramInstance;
    }

    const signer = {
        publicKey,
        signTransaction,
        signAllTransactions,
    };

    const provider = new AnchorProvider(connection, signer, {});
    setProvider(provider);

    // Create program with explicit program ID
    loansProgramInstance = new Program(loansMarketplaceIdl as Idl, provider) as Program<LoansMarketplace>;
    // Set program ID using Object.defineProperty to override readonly
    Object.defineProperty(loansProgramInstance, 'programId', {
        value: LOANS_PROGRAM_ID,
        writable: false,
        configurable: false
    });

    return loansProgramInstance;
};

export const useScoreAttestorProgram = (walletOverride?: Signer) => {
    const wallet = useWallet();
    const signer = walletOverride || wallet;

    if (!signer || !signer.publicKey || !signer.signTransaction || !signer.signAllTransactions) {
        return null;
    }

    // Return cached instance if available
    if (scoreAttestorProgramInstance) {
        return scoreAttestorProgramInstance;
    }

    const provider = new AnchorProvider(connection, {
        publicKey: signer.publicKey,
        signTransaction: signer.signTransaction,
        signAllTransactions: signer.signAllTransactions
    } as Wallet, {});

    setProvider(provider);

    scoreAttestorProgramInstance = new Program(scoreAttestorIdl as Idl, provider) as Program<ScoreAttestor>;
    // Set program ID using Object.defineProperty to override readonly
    Object.defineProperty(scoreAttestorProgramInstance, 'programId', {
        value: SCORE_ATTESTOR_PROGRAM_ID,
        writable: false,
        configurable: false
    });

    return scoreAttestorProgramInstance;
};

export const useAttestationRegistryProgram = () => {
    const { wallet, signTransaction, signAllTransactions, publicKey } = useWallet();

    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) return null;

    // Return cached instance if available
    if (attestationRegistryProgramInstance) {
        return attestationRegistryProgramInstance;
    }

    const signer = {
        publicKey,
        signTransaction,
        signAllTransactions,
    };

    const provider = new AnchorProvider(connection, signer, {});
    setProvider(provider);

    attestationRegistryProgramInstance = new Program(attestationRegistryIdl as Idl, provider) as Program<AttestationRegistry>;

    return attestationRegistryProgramInstance;
};

// Clear cached instances when wallet changes
export const clearProgramInstances = () => {
    loansProgramInstance = null;
    scoreAttestorProgramInstance = null;
    attestationRegistryProgramInstance = null;
};

type Signer = {
    publicKey: anchor.web3.PublicKey | null;
    signTransaction: <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(tx: T) => Promise<T>;
    signAllTransactions: <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(txs: T[]) => Promise<T[]>;
};