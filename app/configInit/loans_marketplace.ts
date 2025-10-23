import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import idl from "./program/idl/loans_marketplace.json";
import type { LoansMarketplace } from "./program/types/loans_marketplace";
import { Program, type Idl } from "@coral-xyz/anchor";

const RPC_ENDPOINT = process.env.RPC_URL || "https://api.devnet.solana.com";
const FEE_BPS = 500; // 5% fee

function getAdminKeypair(): Keypair {
    if (!process.env.ADMIN_PRIVATE_KEY) throw new Error("ADMIN_PRIVATE_KEY not set");
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.ADMIN_PRIVATE_KEY)));
}

function initializeProgram() {
    const admin = getAdminKeypair();
    const provider = new anchor.AnchorProvider(
        new Connection(RPC_ENDPOINT, "confirmed"),
        new anchor.Wallet(admin),
        { commitment: "confirmed" }
    );
    const program = new Program<LoansMarketplace>(idl as Idl, provider);
    return { program, admin };
}

function getConfigPda(program: Program<LoansMarketplace>) {
    return PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);
}

async function initializeConfig(usdcMint: PublicKey) {
    const { program, admin } = initializeProgram();
    const [configPda] = getConfigPda(program);

    console.log("─────────────────────────────────────────────");
    console.log("Config PDA:", configPda.toString());
    console.log("Program ID:", program.programId.toString());
    console.log("Admin:", admin.publicKey.toString());
    console.log("USDC Mint:", usdcMint.toString());
    console.log("─────────────────────────────────────────────");

    try {
        const config = await program.account.config.fetchNullable(configPda);
        if (config) {
            console.log("Config already exists on-chain.");
            return { configPda, isNew: false };
        }
    } catch (e) {
        console.log("No existing config found, creating new one...");
    }

    try {
        const txSig = await program.methods
            .initializeConfig(FEE_BPS)
            .accountsStrict({
                config: configPda,
                admin: admin.publicKey,
                usdcMint,
                systemProgram: SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        console.log("Config initialized successfully!");
        console.log("Transaction signature:", txSig);
        console.log("View on Explorer:", `https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

        return { configPda, isNew: true };
    } catch (err) {
        console.error("Error initializing config:", err);
        throw err;
    }
}

if (require.main === module) {
    (async () => {
        try {
            const usdcMint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
            const { configPda, isNew } = await initializeConfig(usdcMint);

            console.log("\n─────────────────────────────────────────────");
            console.log("Final Result:");
            console.log(JSON.stringify({ configPda: configPda.toString(), isNew }, null, 2));
            console.log("─────────────────────────────────────────────\n");

            process.exit(0);
        } catch (error) {
            console.error("Script failed:", error);
            process.exit(1);
        }
    })();
}

export { initializeConfig, getConfigPda };
