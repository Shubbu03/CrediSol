
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Buffer } from "buffer"
import secp256k1 from "secp256k1"
import * as borsh from "borsh"
import sha3 from 'js-sha3'
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { BN } from '@coral-xyz/anchor';

import { plaidIssuerPubkey } from "../constants/issuers";
import { AttestationRegistry } from "../../program/types/attestation_registry";

const APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APP_ID;
const APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET;

class ReclaimTaskStruct {
    identifier: string;
    owner: string;
    timestamp: number;

    constructor(fields: { identifier: string; owner: string; timestamp: number }) {
        this.identifier = fields.identifier
        this.owner = fields.owner
        this.timestamp = fields.timestamp
    }
}

function hexToBytes(hex: string): Uint8Array {
    return Uint8Array.from(Buffer.from(hex.replace(/^0x/, ""), "hex"));
}

export interface ReclaimProofResult {
    success: boolean;
    signature?: string;
    attestationPda?: string; // Always a string for React compatibility
    error?: string;
}

export const verifyReclaimProof = async ({
    reclaimProof,
    program,
    subjectAddress,
}: {
    reclaimProof: {
        identifier: string;
        claimData: {
            provider: string;
            parameters: string;
            owner: string;
            timestampS: number;
            context: string;
            identifier: string;
            epoch: number;
        };
        signatures: string[];
        witnesses: { id: string; url: string }[];
        publicData: any;
    };
    program: anchor.Program<AttestationRegistry>;
    subjectAddress: string;
}): Promise<ReclaimProofResult> => {
    try {
        const sigBytes = hexToBytes(reclaimProof.signatures[0].slice(2));
        const signatureBytes = sigBytes.slice(0, 64);
        let recoverId = sigBytes[64];
        if (recoverId >= 27) recoverId -= 27;

        const ReclaimTaskSchema = new Map([
            [
                ReclaimTaskStruct,
                {
                    kind: "struct",
                    fields: [
                        ["identifier", "string"],
                        ["owner", "string"],
                        ["timestamp", "u64"],
                    ],
                },
            ],
        ]);

        const message = new ReclaimTaskStruct({
            identifier: reclaimProof.claimData.identifier,
            owner: reclaimProof.claimData.owner,
            timestamp: reclaimProof.claimData.timestampS,
        });

        const plaintext = borsh.serialize(ReclaimTaskSchema, message);
        const plaintextHash = Buffer.from(sha3.keccak_256.digest(Buffer.from(plaintext)));
        const pubKey = secp256k1.ecdsaRecover(signatureBytes, recoverId, plaintextHash, false);

        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + (24 * 7 * 60 * 60) - 200;
        const schemaIdIndex = 4;

        const subjectPubkey = new anchor.web3.PublicKey(subjectAddress);
        const [attestationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("attest"),
                subjectPubkey.toBuffer(),
                Buffer.from([schemaIdIndex]),
                plaidIssuerPubkey.toBuffer(),
            ],
            program.programId
        );

        if (!program.provider) {
            throw new Error('Provider not initialized');
        }

        const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed');

        const tx = await program.methods
            .postAttestation(
                { plaidIncome: {} },
                Array.from(plaintextHash),
                new BN(expiryTs),
                Array.from(signatureBytes),
                recoverId,
                Array.from(pubKey),
                255
            )
            .accountsStrict({
                config: (await program.account.config.all())[0].publicKey,
                subject: subjectPubkey,
                attestation: attestationPda,
                issuer: plaidIssuerPubkey,
                payer: program.provider.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .transaction();

        tx.recentBlockhash = blockhash;
        tx.feePayer = program.provider.publicKey;

        if (!program.provider.wallet) {
            throw new Error('Wallet not connected');
        }
        if (!program.provider.publicKey) {
            throw new Error('No public key available');
        }

        const signedTx = await program.provider.wallet.signTransaction(tx);

        try {
            const signature = await program.provider.connection.sendRawTransaction(
                signedTx.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed',
                }
            );

            await program.provider.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            }, 'confirmed');

        } catch (error: any) {
            console.error('Transaction failed:', error);
            throw new Error(`Transaction failed: ${error.message}`);
        }

        return {
            success: true,
            signature: tx.signature ? tx.signature.toString('base64') : undefined,
            attestationPda: attestationPda.toString(), // Convert to string for React
        };
    } catch (err) {
        console.error("Error verifying reclaim proof:", err);

        let errorMessage = 'Unknown error';
        
        if (err instanceof Error) {
            errorMessage = err.message;
            const anyErr = err as any;
            if (anyErr.logs && Array.isArray(anyErr.logs)) {
                errorMessage = anyErr.logs.join('\n');
            }
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

export const getAttestation = async ({
    address,
    schemaIdIndex = 4,
    issuerPubkey = plaidIssuerPubkey,
    program,
}: {
    address: string;
    schemaIdIndex?: number;
    issuerPubkey?: PublicKey;
    program: anchor.Program<AttestationRegistry>;
}) => {
    try {
        const subjectPubkey = new PublicKey(address);

        const [attestationPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("attest"),
                subjectPubkey.toBuffer(),
                Buffer.from([schemaIdIndex]),
                issuerPubkey.toBuffer(),
            ],
            program.programId
        );

        const attestationAccount = await program.account.attestation.fetchNullable(
            attestationPda
        );

        if (!attestationAccount) {
            console.log("No reclaim attestation found for this address");
            return null;
        }

        const now = Math.floor(Date.now() / 1000);
        const isExpired = attestationAccount.expiryTs.toNumber() < now;
        const isValid = !attestationAccount.revoked && !isExpired;

        return {
            pda: attestationPda.toBase58(),
            subject: attestationAccount.subject.toBase58(),
            schemaId: attestationAccount.schemaId,
            claimHash: Buffer.from(attestationAccount.claimHash).toString("hex"),
            issuer: attestationAccount.issuer.toBase58(),
            issuedAt: new Date(attestationAccount.issuedAt.toNumber() * 1000).toISOString(),
            expiryTs: new Date(attestationAccount.expiryTs.toNumber() * 1000).toISOString(),
            revoked: attestationAccount.revoked,
            isExpired,
            isValid,
            type: 'reclaim',
        };
    } catch (error) {
        console.error('Error getting reclaim attestation:', error);
        return null;
    }
};

export const reclaimProofGenPlaid = async ({
    address,
    program,
}: {
    address: string;
    program: anchor.Program<AttestationRegistry>;
}) => {
    try {
        const PROVIDER_ID = process.env.NEXT_PUBLIC_PLAID_PROVIDER_ID;

        if (!APP_ID || !PROVIDER_ID || !APP_SECRET) {
            console.error("Missing APP_ID or APP_SECRET OR PROVIDER_ID");
            return { success: false, error: 'Missing required environment variables' };
        }

        const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

        const proofs = await new Promise<any>((resolve, reject) => {
            reclaimProofRequest.triggerReclaimFlow()
                .then(() => {
                    reclaimProofRequest.startSession({
                        onSuccess: (proofs: any) => resolve(proofs),
                        onError: (error: any) => reject(error),
                    });
                })
                .catch(reject);
        });

        console.log('Reclaim proof received:', proofs);

        const result = await verifyReclaimProof({
            reclaimProof: proofs,
            program,
            subjectAddress: address,
        });

        return {
            ...result,
            attestationPda: result.attestationPda?.toString(),
        };
    } catch (error) {
        console.error('Error in reclaimProofGenPlaid:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};