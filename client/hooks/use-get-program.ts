import { Program, AnchorProvider, setProvider, type Idl } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

import { connection } from "../lib/solana/connection";
import type { AttestationRegistry } from "../lib/program/types/attestation_registry";
import attestationRegistryIdl from "../lib/program/idl/attestation_registry.json";
import type { LoansMarketplace } from "../lib/program/types/loans_marketplace";
import loansMarketplaceIdl from "../lib/program/idl/loans_marketplace.json";

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
