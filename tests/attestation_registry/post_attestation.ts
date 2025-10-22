import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AttestationRegistry } from "../../target/types/attestation_registry";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { expect } from "chai";

import { Buffer } from "buffer"
import secp256k1 from "secp256k1"
import * as borsh from "borsh"
import sha3 from "js-sha3"

class SolanaTaskStruct {
    task: string;
    schema: string;
    notary: string;

    constructor(fields: { task: string; schema: string; notary: string }) {
        this.task = fields.task;
        this.schema = fields.schema;
        this.notary = fields.notary;
    }
}

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

describe("attestation_registry", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const program = anchor.workspace.AttestationRegistry as Program<AttestationRegistry>;

    let admin: anchor.web3.Keypair;
    let configPda: anchor.web3.PublicKey;
    let configBump: number;
    let zkPassIssuerPubkey: PublicKey;
    let plaidIssuerPubkey: PublicKey;

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * anchor.web3.LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    before(async () => {
        admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey);

        [configPda, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("attest_config")],
            program.programId
        );

        await program.methods
            .initializeConfig(new anchor.BN(3600)) // max_expiry_secs = 3600
            .accountsStrict({
                config: configPda,
                admin: admin.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        const allocatorAddress = "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d";
        const ethAddressBytes1 = Buffer.from(allocatorAddress.slice(2), "hex");
        const padded1 = Buffer.concat([Buffer.alloc(12), ethAddressBytes1]); // 32 bytes
        zkPassIssuerPubkey = new anchor.web3.PublicKey(padded1);

        await program.methods
            .addIssuer(zkPassIssuerPubkey, { ethereum: {} })
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const reclaimIdentifier = "0xdec977493c546ac87206192de85ff8ee431a4167b70bf3d5ef31376de3d268e6";
        const identifierHash = Buffer.from(sha3.keccak_256.digest(Buffer.from(reclaimIdentifier.slice(2), 'hex')));
        const padded = Buffer.concat([Buffer.alloc(32 - identifierHash.length), identifierHash]);
        plaidIssuerPubkey = new anchor.web3.PublicKey(padded);

        await program.methods
            .addIssuer(plaidIssuerPubkey, { ethereum: {} })
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();
    });

    it("Posts an attestation zkPass", async () => {
        const publicFieldsHash = "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6";
        const uHash = "0x758ce540c0f16c7d2e41dd63b356cb4ad369a9ca7c157b9333eedb3115b48f40";
        const validatorSignature = "0x2d3c7d3fb68d1afa9562a141f9f3f02e63427fbac37478df57004c4b4b7ad1c76c5475990b757975a3794c52394f5138eccd0738d70a8d8c150b3f212d68b0ad01"
        const recipient = "D6AZeqimKEEq6uLRW23i2PpTDs1JyknZCqH1QDHLoAHf";
        const allocatorAddress = "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d"
        const taskId = "9ef83f6165d0401c815b1a892b5ac93c";
        const validatorAddress = "e504ad91fbaad88362941a65b1c4c1e1cdd5cf69e27a3a08c8f51145c2e12c6a";
        const schema = "2a5bd6de00794f71aab7a556e0bcef43";
        const allocatorSignature = "0x45adc69669fadba9546c984179c446aac25c2c7fe5176d7e4d45138e595d7f00094dcbf015023d8c0b8da88479d10aa15a21dc4535fce9fa428a0e9293c1197e00"

        const sig_bytes = hexToBytes(allocatorSignature.slice(2));
        const signatureBytes = sig_bytes.slice(0, 64);
        const recoverId = Array.from(sig_bytes.slice(64))[0];
        const SolanaTaskSchema = new Map([
            [SolanaTaskStruct, {
                kind: "struct",
                fields: [
                    ["task", "string"],
                    ["schema", "string"],
                    ["notary", "string"],
                ],
            }],
        ]);
        const message = new SolanaTaskStruct({
            task: taskId,
            schema: schema,
            notary: validatorAddress,
        });
        const plaintext = borsh.serialize(SolanaTaskSchema, message);
        const plaintextHash = Buffer.from(sha3.keccak_256.digest(Buffer.from(plaintext)));
        const pubKey = secp256k1.ecdsaRecover(signatureBytes, recoverId, plaintextHash, false);

        // const pubkeyHash = sha3.keccak_256.create();
        // pubkeyHash.update(pubKey.slice(1));
        // const hashed = Buffer.from(pubkeyHash.digest());
        // const recoveredAddressBytes = hashed.slice(-20);
        // const recoveredAddress = recoveredAddressBytes.toString("hex").toLowerCase();
        // const allocatorFromProof = allocatorAddress.replace(/^0x/, "").toLowerCase();
        // console.log("Recovered Address:", recoveredAddress);
        // console.log("Proof Allocator Address:", allocatorFromProof);

        const subject = anchor.web3.Keypair.generate();
        await airdrop(subject.publicKey);

        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + 3500; // < 3600, safe
        const schemaIdIndex = 1;
        const [attestationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("attest"),
                subject.publicKey.toBuffer(),
                Buffer.from([schemaIdIndex]),
                zkPassIssuerPubkey.toBuffer(),
            ],
            program.programId
        );

        await airdrop(subject.publicKey)
        await program.methods
            .postAttestation(
                { zkPassIdentity: {} },
                Array.from(plaintextHash),
                new BN(expiryTs),
                Array.from(signatureBytes),
                recoverId,
                Array.from(pubKey),
                255
            )
            .accountsStrict({
                config: configPda,
                subject: subject.publicKey,
                attestation: attestationPda,
                issuer: zkPassIssuerPubkey,
                payer: subject.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([subject])
            .rpc();

        const attestationAccount = await program.account.attestation.fetch(attestationPda);
        expect(attestationAccount.subject.toBase58()).to.equal(subject.publicKey.toBase58());
        expect(attestationAccount.expiryTs.eq(new BN(expiryTs))).to.be.true;
        expect(Buffer.from(attestationAccount.claimHash).toString("hex")).to.equal(
            Buffer.from(plaintextHash).toString("hex")
        );
    });

    it("Posts an attestation Reclaim", async () => {
        const reclaimProof = {
            identifier:
                "0xdec977493c546ac87206192de85ff8ee431a4167b70bf3d5ef31376de3d268e6",
            claimData: {
                provider: "http",
                parameters:
                    "{\"url\":\"https://github.com/settings/profile\",\"method\":\"GET\",\"paramValues\":{\"username\":\"a-khushal\"}}",
                owner: "0x7af75fb20c6a3ad403c568430f3cab891c961191",
                timestampS: 1760538182,
                context:
                    "{\"contextAddress\":\"0x0\",\"contextMessage\":\"sample context\"}",
                identifier:
                    "0xdec977493c546ac87206192de85ff8ee431a4167b70bf3d5ef31376de3d268e6",
                epoch: 1,
            },
            signatures: [
                "0xbcea92660547f60f8a118683c01a3521adb6f7a68ce227e0131cad68b9bf30f0087778ce4990960620ec8ca6b6f11a79c5b7e0daf29158f1fa0a7631aa5d99081b",
            ],
            witnesses: [
                {
                    id: "0x244897572368eadf65bfbc5aec98d8e5443a9072",
                    url: "wss://attestor.reclaimprotocol.org/ws",
                },
            ],
            publicData: null,
        };

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

        const subject = anchor.web3.Keypair.generate();
        await airdrop(subject.publicKey);

        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + 3500;
        const schemaIdIndex = 4;
        const [attestationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("attest"),
                subject.publicKey.toBuffer(),
                Buffer.from([schemaIdIndex]),
                plaidIssuerPubkey.toBuffer(),
            ],
            program.programId
        );

        await program.methods
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
                config: configPda,
                subject: subject.publicKey,
                attestation: attestationPda,
                issuer: plaidIssuerPubkey,
                payer: subject.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([subject])
            .rpc();
        const attestationAccount = await program.account.attestation.fetch(attestationPda);
        expect(attestationAccount.subject.toBase58()).to.equal(subject.publicKey.toBase58());
        expect(attestationAccount.expiryTs.eq(new BN(expiryTs))).to.be.true;
        expect(Buffer.from(attestationAccount.claimHash).toString("hex")).to.equal(
            Buffer.from(plaintextHash).toString("hex")
        );
    });
});

