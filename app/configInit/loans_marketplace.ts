import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import idl from "./program/idl/loans_marketplace.json";
import type { LoansMarketplace } from "./program/types/loans_marketplace";
import { Program } from "@coral-xyz/anchor";
import { type Idl } from "@coral-xyz/anchor";

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
    return {
        program: new Program<LoansMarketplace>(idl as Idl, provider),
        admin,
    };
}

function getConfigPda(program: Program<LoansMarketplace>) {
    return PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);
}

async function initializeConfig(usdcMint: PublicKey) {
    const { program, admin } = initializeProgram();
    const [configPda] = getConfigPda(program);

    console.log('Config PDA:', configPda.toString());
    console.log('Program ID:', program.programId.toString());
    console.log('Admin:', admin.publicKey.toString());
    console.log('USDC Mint:', usdcMint.toString());

    try {
        const config = await program.account.config.fetchNullable(configPda);
        if (config) return { configPda, isNew: false };
    } catch { }

    await program.methods
        .initializeConfig(FEE_BPS)
        .accounts({
            admin: admin.publicKey,
            usdcMint,
        })
        .signers([admin])
        .rpc();

    return { configPda, isNew: true };
}

if (require.main === module) {
    (async () => {
        try {
            const usdcMint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
            const { configPda, isNew } = await initializeConfig(usdcMint);
            console.log(JSON.stringify({ configPda: configPda.toString(), isNew }, null, 2));
            process.exit(0);
        } catch (error) {
            process.exit(1);
        }
    })();
}

export { initializeConfig, getConfigPda };
