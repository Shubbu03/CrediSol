"use client";

import { Connection } from '@solana/web3.js';

// Using devnet for development
const DEVNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

export const connection = new Connection(DEVNET_RPC, {
    commitment: 'confirmed',
    wsEndpoint: DEVNET_RPC.replace('https://', 'wss://'),
    // Add rate limiting to prevent 429 errors
    fetch: (url, options) => {
        // Add a small delay to prevent rapid-fire requests
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(fetch(url, options));
            }, 100); // 100ms delay between requests
        });
    },
});

export { DEVNET_RPC as RPC_ENDPOINT };
