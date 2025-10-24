import { Program, AnchorProvider, setProvider, type Idl, Wallet } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

import { connection } from "../lib/solana/connection";
import type { AttestationRegistry } from "../lib/program/types/attestation_registry";
import attestationRegistryIdl from "../lib/program/idl/attestation_registry.json";
import type { LoansMarketplace } from "../lib/program/types/loans_marketplace";
import loansMarketplaceIdl from "../lib/program/idl/loans_marketplace.json";
import type { ScoreAttestor } from "../lib/program/types/score_attestor";
import scoreAttestorIdl from "../lib/program/idl/score_attestor.json";


export const useAttesttationRegistryProgram = () => {
    const { wallet, signTransaction, signAllTransactions, publicKey } = useWallet();

    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) return null;

    const signer = {
        publicKey,
        signTransaction,
        signAllTransactions,
    };
    const provider = new AnchorProvider(connection, signer, {});
    setProvider(provider);

    const program = new Program(attestationRegistryIdl as Idl, provider) as Program<AttestationRegistry>;
    return program
};

export const useLoansMarketplaceProgram = () => {
    const { wallet, signTransaction, signAllTransactions, publicKey } = useWallet();

    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) return null;

    const signer = {
        publicKey,
        signTransaction,
        signAllTransactions,
    };
    const provider = new AnchorProvider(connection, signer, {});
    setProvider(provider);

    const program = new Program(loansMarketplaceIdl as Idl, provider) as Program<LoansMarketplace>;
    return program
};

type Signer = {
    publicKey: anchor.web3.PublicKey | null;
    signTransaction: <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(tx: T) => Promise<T>;
    signAllTransactions: <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(txs: T[]) => Promise<T[]>;
};

export const useScoreAttestorProgram = (walletOverride?: Signer) => {
    const wallet = useWallet();

    const signer = walletOverride || wallet;

    if (!signer || !signer.publicKey || !signer.signTransaction || !signer.signAllTransactions) {
        return null;
    }

    const provider = new AnchorProvider(connection, {
        publicKey: signer.publicKey,
        signTransaction: signer.signTransaction,
        signAllTransactions: signer.signAllTransactions
    } as Wallet, {});

    setProvider(provider);

    return new Program(scoreAttestorIdl as Idl, provider) as Program<ScoreAttestor>;
};