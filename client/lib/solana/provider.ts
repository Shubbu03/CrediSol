"use client";

import { AnchorProvider } from '@coral-xyz/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { connection } from './connection';

export function useAnchorProvider() {
    const wallet = useWallet();

    if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
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
