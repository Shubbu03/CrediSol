import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import idl from "./program/idl/attestation_registry.json";
import type { AttestationRegistry } from "./program/types/attestation_registry";
import { Program } from "@coral-xyz/anchor";
import { type Idl } from "@coral-xyz/anchor";

const secret = Uint8Array.from(JSON.parse(process.env.ADMIN_PRIVATE_KEY!));
const admin = Keypair.fromSecretKey(secret);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), {
    preflightCommitment: "confirmed",
});
anchor.setProvider(provider);

const programId = new PublicKey(idl.address);
const program = new Program<AttestationRegistry>(idl as Idl, provider);
const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("attest_config")],
    program.programId
);

async function initializeConfig(maxExpirySecs: number) {
    await program.methods
        .initializeConfig(new anchor.BN(maxExpirySecs))
        .accountsStrict({
            config: configPda,
            admin: admin.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

    console.log("Config initialized at:", configPda.toBase58());
    return configPda;
}

// initializeConfig(60 * 60 * 24 * 7)
//     .then(() => console.log("Done"))
//     .catch((err) => console.error(err));

async function addIssuer() {
    const zkAllocatorADdress = "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d";
    const ethAddressBytes1 = Buffer.from(zkAllocatorADdress.slice(2), "hex");
    const padded1 = Buffer.concat([Buffer.alloc(12), ethAddressBytes1]); // 32 bytes
    const zkPassIssuerPubkey = new PublicKey(padded1);

    await program.methods
        .addIssuer(zkPassIssuerPubkey, { ethereum: {} })
        .accounts({
            config: configPda,
            admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

    console.log("Issuer added at:", zkPassIssuerPubkey.toBase58());

    const reclaimOwner = "0x7af75fb20c6a3ad403c568430f3cab891c961191";
    const ethAddressBytes = Buffer.from(reclaimOwner.slice(2), "hex");
    const padded = Buffer.concat([Buffer.alloc(12), ethAddressBytes]);
    const plaidIssuerPubkey = new anchor.web3.PublicKey(padded);

    await program.methods
        .addIssuer(plaidIssuerPubkey, { ethereum: {} })
        .accounts({
            config: configPda,
            admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

    console.log("Issuer added at:", plaidIssuerPubkey.toBase58());
}

addIssuer()
    .then(() => {
        console.log("configPda:", configPda.toBase58());
        console.log("Done")
    })
    .catch((err) => console.error(err));
