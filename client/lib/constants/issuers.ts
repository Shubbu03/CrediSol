import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

export function ethAddressToSolanaPublicKey(ethAddress: string): PublicKey {
    const ethAddressBytes = Buffer.from(ethAddress.replace(/^0x/, ""), "hex");
    const padded = Buffer.concat([Buffer.alloc(12), ethAddressBytes]);
    return new PublicKey(padded);
}

export const ZKPASS_ALLOCATOR_ADDRESS = "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d";
export const RECLAIM_OWNER_ADDRESS = "0x7af75fb20c6a3ad403c568430f3cab891c961191";

export const zkPassIssuerPubkey = ethAddressToSolanaPublicKey(ZKPASS_ALLOCATOR_ADDRESS);
export const plaidIssuerPubkey = ethAddressToSolanaPublicKey(RECLAIM_OWNER_ADDRESS);

export const ISSUERS = {
    zkPass: {
        ethAddress: ZKPASS_ALLOCATOR_ADDRESS,
        solanaPublicKey: zkPassIssuerPubkey,
    },
    plaid: {
        ethAddress: RECLAIM_OWNER_ADDRESS,
        solanaPublicKey: plaidIssuerPubkey,
    },
} as const;
