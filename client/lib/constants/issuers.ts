import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

export function ethAddressToSolanaPublicKey(ethAddress: string): PublicKey {
    const ethAddressBytes = Buffer.from(ethAddress.replace(/^0x/, ""), "hex");
    const padded = Buffer.concat([Buffer.alloc(12), ethAddressBytes]);
    return new PublicKey(padded);
}

export const ZKPASS_ALLOCATOR_ADDRESS = "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d";
export const RECLAIM_IDENTIFIER = "0xdec977493c546ac87206192de85ff8ee431a4167b70bf3d5ef31376de3d268e6";

export const zkPassIssuerPubkey = ethAddressToSolanaPublicKey(ZKPASS_ALLOCATOR_ADDRESS);
export const plaidIssuerPubkey = ethAddressToSolanaPublicKey(RECLAIM_IDENTIFIER);

export const ISSUERS = {
    zkPass: {
        ethAddress: ZKPASS_ALLOCATOR_ADDRESS,
        solanaPublicKey: zkPassIssuerPubkey,
    },
    plaid: {
        ethAddress: RECLAIM_IDENTIFIER,
        solanaPublicKey: plaidIssuerPubkey,
    },
} as const;
