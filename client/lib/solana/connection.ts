"use client";

import { Connection } from '@solana/web3.js';

// Using devnet for development
const DEVNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

export const connection = new Connection(DEVNET_RPC, {
    commitment: 'confirmed',
    wsEndpoint: DEVNET_RPC.replace('https://', 'wss://'),
});

export { DEVNET_RPC as RPC_ENDPOINT };
