import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "./program/idl/score_attestor.json";
import { Program } from "@coral-xyz/anchor";
import * as secp256k1 from "secp256k1";
import type { ScoreAttestor } from "./program/types/score_attestor";

const RPC = process.env.RPC_URL || "https://api.devnet.solana.com";

function getAdmin(): Keypair {
    if (!process.env.ADMIN_PRIVATE_KEY) {
        throw new Error("Missing ADMIN_PRIVATE_KEY in .env");
    }
    return Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(process.env.ADMIN_PRIVATE_KEY))
    );
}

function getProgram(admin: Keypair) {
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(RPC, "confirmed"),
        new anchor.Wallet(admin),
        { commitment: "confirmed" }
    );
    return new Program<ScoreAttestor>(idl as any, provider);
}

function getSecp256k1Keypair() {
    const priv = process.env.SECP256K1_PRIVATE_KEY!;
    const privArray = new Uint8Array(JSON.parse(priv));
    const pub = secp256k1.publicKeyConvert(secp256k1.publicKeyCreate(privArray), false);
    return { privArray, pub };
}

async function main() {
    console.log("Initializing config...");

    // Setup
    const admin = getAdmin();
    const program = getProgram(admin);
    const { privArray: _priv, pub } = getSecp256k1Keypair();
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("score_config")],
        program.programId
    );

    try {
        console.log("Admin:", admin.publicKey.toString());
        console.log("Secp256k1 Pubkey (hex):", Buffer.from(pub).toString('hex'));

        // Initialize the config
        console.log("Initializing config account...");
        const tx = await program.methods
            .initializeConfig(admin.publicKey, Array.from(pub))
            .accountsStrict({
                config: configPda,
                admin: admin.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        console.log("Config initialized successfully!");
        console.log("Transaction signature:", tx);
        console.log("Config PDA:", configPda.toString());

        // Verify the config
        const config = await program.account.config.fetch(configPda);
        console.log("\nConfig account data:");
        console.log("- Admin:", config.admin.toString());
        console.log("- Attestor:", config.attestor.toString());
        // @ts-ignore
        console.log("- Secp256k1 Pubkey:", Buffer.from(config.secp256K1Pubkey).toString('hex'));
        console.log("- Paused:", config.paused);
        console.log("- Bump:", config.bump);

    } catch (error) {
        console.error("Error initializing config:", error);
        process.exit(1);
    }
}

main().catch(console.error);