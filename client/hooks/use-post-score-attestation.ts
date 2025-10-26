import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { ScoreAttestor } from "../lib/program/types/score_attestor";
import { PublicKey } from "@solana/web3.js";
import { notify } from "../lib/notify";
import * as secp256k1 from "secp256k1";
import * as sha3 from "js-sha3";
import { getCreditScore } from "../app/actions/getCreditScore";
import { Buffer } from "buffer";

export interface PostScoreAttestationParams {
    program: anchor.Program<ScoreAttestor>;
    subject: PublicKey;
    loan: PublicKey;
    score: number;
    grade: number;
    pdBps: number;
    expiryTs: number;
}

export interface PostScoreAttestationResult {
    success: boolean;
    transaction?: anchor.web3.Transaction;
    scorePda?: string;
    error?: string;
    signature?: string;
}

const getSecp256k1PrivateKeyFromEnv = (): Uint8Array => {
    const privateKeyString = process.env.NEXT_PUBLIC_SECP256K1_PRIVATE_KEY;
    if (!privateKeyString) {
        throw new Error("NEXT_PUBLIC_SECP256K1_PRIVATE_KEY environment variable not set");
    }
    const privateKeyArray = privateKeyString.split(',').map(Number);
    return Uint8Array.from(privateKeyArray);
};

const getAttestorKeypair = (): anchor.web3.Keypair => {
    const privateKeyString = process.env.NEXT_PUBLIC_ATTESTOR_PRIVATE_KEY;
    if (!privateKeyString) {
        throw new Error("NEXT_PUBLIC_ATTESTOR_PRIVATE_KEY environment variable not set");
    }

    try {
        const privateKeyArray = JSON.parse(privateKeyString);
        if (!Array.isArray(privateKeyArray) || privateKeyArray.length < 32) {
            throw new Error("Invalid private key format");
        }

        const secretKey = Uint8Array.from(privateKeyArray);
        return anchor.web3.Keypair.fromSecretKey(secretKey);
    } catch (error) {
        console.error("Error parsing attestor private key:", error);
        throw new Error("Failed to parse attestor private key. Please ensure it's in the correct format (copy the full array from id.json)");
    }
};


function toBigUInt64BE(value: number | bigint): Buffer {
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigUInt64BE(BigInt(value));
    return buf;
}

const getSecp256k1Keypair = (): { privateKey: Uint8Array; publicKey: Uint8Array } => {
    // Use the same private key as in the config initialization script
    const privateKey = new Uint8Array([234, 139, 24, 49, 222, 232, 22, 232, 252, 73, 117, 245, 166, 15, 120, 214, 65, 241, 56, 39, 111, 216, 57, 117, 59, 150, 6, 254, 173, 236, 244, 20]);

    const publicKeyCompressed = secp256k1.publicKeyCreate(privateKey);
    const publicKey = secp256k1.publicKeyConvert(publicKeyCompressed, false);

    console.log('Using secp256k1 keypair:');
    console.log('Private key (hex):', Buffer.from(privateKey).toString('hex'));
    console.log('Public key (hex):', Buffer.from(publicKey).toString('hex'));

    return { privateKey, publicKey };
};

export const postScoreAttestationTransaction = async ({
    program,
    subject,
    loan,
    expiryTs,
}: PostScoreAttestationParams): Promise<PostScoreAttestationResult> => {
    try {
        if (!program.provider) throw new Error("Provider not initialized");
        const data = await getCreditScore(subject.toBase58());
        if (!data) throw new Error("Failed to fetch credit score");

        const { privateKey, publicKey: secp256k1PublicKey } = getSecp256k1Keypair();

        const now = Math.floor(Date.now() / 1000);

        const messageData = Buffer.concat([
            subject.toBuffer(),
            toBigUInt64BE(data.score),
            toBigUInt64BE(now),
        ]);

        const messageHash = Buffer.from(sha3.keccak_256.digest(messageData));

        const sigObj = secp256k1.ecdsaSign(messageHash, privateKey);
        const signatureBytes = sigObj.signature;
        const recoveryId = sigObj.recid;

        const isValid = secp256k1.ecdsaVerify(
            signatureBytes,
            messageHash,
            secp256k1PublicKey
        );

        if (!isValid) {
            throw new Error('Generated signature is not valid');
        }

        const recoveredPubKey = secp256k1.ecdsaRecover(
            signatureBytes,
            recoveryId,
            messageHash,
            false
        );

        const recoveredPubKeyHex = Buffer.from(recoveredPubKey).toString('hex');
        const expectedPubKeyHex = Buffer.from(secp256k1PublicKey).toString('hex');

        if (recoveredPubKeyHex !== expectedPubKeyHex) {
            throw new Error('Signature recovery failed: public key mismatch');
        }

        const [scorePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score"), subject.toBuffer(), loan.toBuffer()],
            program.programId
        );

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config")],
            program.programId
        );

        console.log('Config PDA:', configPda.toBase58());

        const attestorKeypair = getAttestorKeypair();
        console.log('Attestor public key:', attestorKeypair.publicKey.toBase58());

        const attestorWallet = {
            publicKey: attestorKeypair.publicKey,
            signTransaction: async <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(
                tx: T
            ): Promise<T> => {
                if ('version' in tx) {
                    tx.sign([attestorKeypair]);
                } else {
                    tx.sign(attestorKeypair);
                }
                return tx;
            },
            signAllTransactions: async <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(
                txs: T[]
            ): Promise<T[]> => {
                return Promise.all(txs.map(tx => {
                    if ('version' in tx) {
                        tx.sign([attestorKeypair]);
                    } else {
                        tx.sign(attestorKeypair);
                    }
                    return tx;
                }));
            }
        };

        const provider = new anchor.AnchorProvider(
            program.provider.connection,
            attestorWallet,
            {}
        );

        const attestorProgram = new anchor.Program(
            program.idl as anchor.Idl,
            provider
        );

        const signature = await attestorProgram.methods
            .postScoreAttestation(
                data.score,
                data.grade,
                data.pdBps,
                300,
                new BN(expiryTs),
                Array.from(messageHash),
                Array.from(signatureBytes),
                recoveryId
            )
            .accountsStrict({
                config: configPda,
                subject,
                loan,
                attestor: attestorKeypair.publicKey,
                score: scorePda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([attestorKeypair])
            .rpc({ skipPreflight: false, preflightCommitment: 'confirmed' });

        console.log('Transaction signature:', signature);

        return {
            success: true,
            signature,
            scorePda: scorePda.toString(),
        };
    } catch (error: any) {
        console.error("Error creating score attestation transaction:", error);
        return {
            success: false,
            error: error.message || "Failed to create score attestation transaction",
        };
    }
};

export const usePostScoreAttestation = () => {
    const postScoreAttestation = async (params: PostScoreAttestationParams): Promise<PostScoreAttestationResult> => {
        try {
            const { success, signature, scorePda, error } = await postScoreAttestationTransaction(params);

            if (!success) throw new Error(error || "Failed to create transaction");

            notify({
                type: "success",
                description: "Score attestation posted successfully!",
            });

            return { success, signature, scorePda };
        } catch (error: any) {
            console.error("Error in postScoreAttestation:", error);

            notify({
                type: "error",
                description: error.message || "Failed to post score attestation",
            });

            return {
                success: false,
                error: error.message || "Failed to post score attestation"
            };
        }
    };

    return { postScoreAttestation };
};

export default usePostScoreAttestation;
