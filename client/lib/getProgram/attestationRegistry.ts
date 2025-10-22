import { Program, AnchorProvider, setProvider, type Idl } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

import type { AttestationRegistry } from "../../program/types/attestation_registry";
import idl from "../../program/idl/attestation_registry.json";

export const getProgram = () => {
    const { wallet, signTransaction, signAllTransactions, publicKey } = useWallet();
    const connection = new Connection(clusterApiUrl("devnet"));

    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) return null;

    const signer = {
        publicKey,
        signTransaction,
        signAllTransactions,
    };
    const provider = new AnchorProvider(connection, signer, {});
    setProvider(provider);

    const program = new Program(idl as Idl, provider) as Program<AttestationRegistry>;
    return program
};