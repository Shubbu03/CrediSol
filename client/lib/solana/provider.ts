"use client";

import { AnchorProvider } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export function useAnchorProvider() {
    const wallet = useWallet();
    const { connection } = useConnection();

    if (!wallet.publicKey || !wallet.signTransaction) {
        return null; // Return null instead of throwing error
    }

    return new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
    );
}

export function useWalletConnection() {
    const { connected, publicKey, signTransaction } = useWallet();

    return {
        connected,
        publicKey,
        signTransaction,
        isReady: connected && !!publicKey && !!signTransaction
    };
}
