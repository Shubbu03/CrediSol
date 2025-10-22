
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Buffer } from "buffer"
import secp256k1 from "secp256k1"
import * as borsh from "borsh"
import sha3 from 'js-sha3'

import { zkPassIssuerPubkey } from "../constants/issuers";
import { AttestationRegistry } from "../../program/types/attestation_registry";

const APP_ID = process.env.NEXT_PUBLIC_ZKPASS_APP_ID;
const SCHEMA_ID = process.env.NEXT_PUBLIC_ZKPASS_SCHEMA_ID;

class ZKPassTaskStruct {
    task: string;
    schema: string;
    notary: string;

    constructor(fields: { task: string; schema: string; notary: string }) {
        this.task = fields.task;
        this.schema = fields.schema;
        this.notary = fields.notary;
    }
}

function hexToBytes(hex: string): Uint8Array {
    return Uint8Array.from(Buffer.from(hex.replace(/^0x/, ""), "hex"));
}

export const zkPassProofGen = async ({ address, program }: {
    address: string;
    program: anchor.Program<AttestationRegistry>;
}) => {
    try {
        if (!APP_ID || !SCHEMA_ID) {
            console.error("Missing APP_ID or SCHEMA_ID");
            return;
        }

        const connector = new TransgateConnect(APP_ID);
        const available = await connector.isTransgateAvailable();
        if (!available) {
            alert("zkPass extension not found. Please install it.");
            return;
        }

        const res: any = await connector.launchWithSolana(SCHEMA_ID, address);
        const { taskId, allocatorSignature, validatorAddress } = res
        const sig_bytes = hexToBytes(allocatorSignature.slice(2));
        const signatureBytes = sig_bytes.slice(0, 64);
        const recoverId = Array.from(sig_bytes.slice(64))[0];
        const message = new ZKPassTaskStruct({
            task: taskId,
            schema: SCHEMA_ID,
            notary: validatorAddress,
        });

        const zkPassTaskSchema = new Map([
            [ZKPassTaskStruct, {
                kind: 'struct',
                fields: [
                    ['task', 'string'],
                    ['schema', 'string'],
                    ['notary', 'string']
                ]
            }]
        ]);

        const plaintext = borsh.serialize(zkPassTaskSchema as any, message);
        const plaintextHash = Buffer.from(sha3.keccak_256.digest(Buffer.from(plaintext)));
        const pubKey = secp256k1.ecdsaRecover(signatureBytes, recoverId, plaintextHash, false);
        // const pubkeyHash = sha3.keccak_256.create();
        // pubkeyHash.update(pubKey.slice(1));
        // const hashed = Buffer.from(pubkeyHash.digest());
        // const recoveredAddressBytes = hashed.slice(-20);
        // const recoveredAddress = recoveredAddressBytes.toString("hex").toLowerCase();
        // const allocatorFromProof = res.allocatorAddress.replace(/^0x/, "").toLowerCase();

        // const isValid = recoveredAddress === allocatorFromProof;
        // if (isValid) {
        //     alert("Proof generated successfully");
        // } else {
        //     alert("Proof generation failed");
        // }

        console.log("zkPass proof result:", res);

        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + 24 * 7 * 60 * 60 - 200;
        const schemaIdIndex = 1;

        if (!program) return;
        const recipientPubkey = new PublicKey(address);
        const [attestationPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("attest"),
                recipientPubkey.toBuffer(),
                Buffer.from([schemaIdIndex]),
                zkPassIssuerPubkey.toBuffer(),
            ],
            program.programId
        );

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("attest_config")],
            program.programId
        );

        try {
            try {
                const existingAttestation = await program.account.attestation.fetch(attestationPda);
                console.log('Attestation already exists:', existingAttestation);
                return {
                    success: true,
                    signature: '',
                    attestationPda: attestationPda.toBase58(),
                    alreadyExists: true
                };
            } catch (error) {
                console.log('No existing attestation found, creating a new one...');
            }

            const tx = await program.methods
                .postAttestation(
                    { zkPassIdentity: {} },
                    Array.from(plaintextHash),
                    new anchor.BN(expiryTs),
                    Array.from(signatureBytes),
                    recoverId,
                    Array.from(pubKey),
                    255
                )
                .accountsStrict({
                    config: configPda,
                    subject: recipientPubkey,
                    attestation: attestationPda,
                    issuer: zkPassIssuerPubkey,
                    payer: recipientPubkey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();

            console.log("Transaction signature:", tx);

            const listener = program.addEventListener("attestationPosted", (event, slot) => {
                console.log("AttestationPosted event received:", {
                    subject: event.subject.toBase58(),
                    schemaId: event.schemaId,
                    issuer: event.issuer.toBase58(),
                    claimHash: Buffer.from(event.claimHash).toString("hex"),
                    expiryTs: event.expiryTs.toString(),
                    slot,
                });
            });

            setTimeout(() => {
                program.removeEventListener(listener);
            }, 60000);

            return {
                success: true,
                signature: tx,
                attestationPda: attestationPda.toBase58(),
                alreadyExists: false
            };
        } catch (error: any) {
            if (error.message && error.message.includes('already been processed')) {
                console.log('Transaction was already processed, checking attestation status...');
                try {
                    const attestation = await program.account.attestation.fetch(attestationPda);
                    return {
                        success: true,
                        signature: '',
                        attestationPda: attestationPda.toBase58(),
                        alreadyExists: true
                    };
                } catch (fetchError) {
                    console.error('Error fetching attestation after duplicate tx error:', fetchError);
                    throw error;
                }
            }
            throw error;
        }
    } catch (error) {
        console.error("Error generating zkPass proof:", error);
        return { success: false, error };
    }
}

export const getAttestation = async ({
    address,
    issuerPubkey = zkPassIssuerPubkey,
    schemaIdIndex = 1,
    program,
}: {
    address: string;
    issuerPubkey?: PublicKey;
    schemaIdIndex?: number;
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
            console.log("No attestation found for this address");
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
            bump: attestationAccount.bump,
        };
    } catch (error) {
        console.error("Error fetching attestation:", error);
        return null;
    }
}

// export const getAllAttestations = async (address: string) => {
//     try {
//         const program = getProgram();
//         if (!program) {
//             console.error("Program not initialized");
//             return [];
//         }

//         const subjectPubkey = new PublicKey(address);

//         // Fetch all attestation accounts where the subject matches
//         const attestations = await program.account.attestation.all([
//             {
//                 memcmp: {
//                     offset: 8,
//                     bytes: subjectPubkey.toBase58(),
//                 },
//             },
//         ]);

//         const now = Math.floor(Date.now() / 1000);

//         return attestations.map((attestation) => {
//             const isExpired = attestation.account.expiryTs.toNumber() < now;
//             const isValid = !attestation.account.revoked && !isExpired;

//             return {
//                 pda: attestation.publicKey.toBase58(),
//                 subject: attestation.account.subject.toBase58(),
//                 schemaId: attestation.account.schemaId,
//                 claimHash: Buffer.from(attestation.account.claimHash).toString("hex"),
//                 issuer: attestation.account.issuer.toBase58(),
//                 issuedAt: new Date(attestation.account.issuedAt.toNumber() * 1000).toISOString(),
//                 expiryTs: new Date(attestation.account.expiryTs.toNumber() * 1000).toISOString(),
//                 revoked: attestation.account.revoked,
//                 isExpired,
//                 isValid,
//                 bump: attestation.account.bump,
//             };
//         });
//     } catch (error) {
//         console.error("Error fetching all attestations:", error);
//         return [];
//     }
// }
