import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { ScoreAttestor } from "../../target/types/score_attestor";
import { BN } from "bn.js";

describe("admin_only", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ScoreAttestor as Program<ScoreAttestor>;

    let configPda: PublicKey;
    let bump: number;
    let newAdmin: Keypair;

    before(async () => {
        [configPda, bump] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config")],
            program.programId
        );

        let configExists = true;
        try {
            await program.account.config.fetch(configPda);
        } catch {
            configExists = false;
        }

        if (!configExists) {
            await program.methods
                .initializeConfig(3, new BN(3600))
                .accountsStrict({
                    config: configPda,
                    admin: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([])
                .rpc();
        }
    });

    describe("Admin Changes", () => {
        it("sets a new admin", async () => {
            newAdmin = Keypair.generate();

            await program.methods
                .setAdmin(newAdmin.publicKey)
                .accounts({
                    config: configPda,
                    admin: provider.wallet.publicKey,
                })
                .rpc();

            const config = await program.account.config.fetch(configPda);
            expect(config.admin.toBase58()).to.equal(newAdmin.publicKey.toBase58());
        });

        it("pauses and unpauses the contract", async () => {
            await program.methods
                .setPaused(true)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            let config = await program.account.config.fetch(configPda);
            expect(config.paused).to.be.true;

            await program.methods
                .setPaused(false)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            config = await program.account.config.fetch(configPda);
            expect(config.paused).to.be.false;
        });
    });

    describe("Oracles", () => {
        it("adds and removes an oracle", async () => {
            const oracle = Keypair.generate().publicKey;

            await program.methods
                .addOracle(oracle)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            let config = await program.account.config.fetch(configPda);
            expect(config.oracles.map((o: PublicKey) => o.toBase58())).to.include(
                oracle.toBase58()
            );

            await program.methods
                .removeOracle(oracle)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            config = await program.account.config.fetch(configPda);
            expect(config.oracles.map((o: PublicKey) => o.toBase58())).to.not.include(
                oracle.toBase58()
            );
        });

        it("sets oracle threshold", async () => {
            const config = await program.account.config.fetch(configPda);

            if (config.oracles.length === 0) {
                const oracle = Keypair.generate().publicKey;
                await program.methods
                    .addOracle(oracle)
                    .accounts({
                        config: configPda,
                        admin: newAdmin.publicKey,
                    })
                    .signers([newAdmin])
                    .rpc();
            }

            const updatedConfig = await program.account.config.fetch(configPda);
            const threshold = Math.min(1, updatedConfig.oracles.length);

            await program.methods
                .setOracleThreshold(threshold)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            const finalConfig = await program.account.config.fetch(configPda);
            expect(finalConfig.oracleThreshold).to.equal(threshold);
        });
    });

    describe("Models", () => {
        it("adds a model and changes its status", async () => {
            const modelId = Array.from(Buffer.alloc(32, 1));
            const modelIdWrapper = { 0: modelId };
            const version = 1;

            await program.methods
                .addModel(modelIdWrapper, version)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            let config = await program.account.config.fetch(configPda);
            let model = config.models.find(
                (m: any) =>
                    Buffer.from(m.modelId[0]).equals(Buffer.from(modelId)) &&
                    m.version === version
            );
            expect(model).to.exist;
            expect(model.enabled).to.be.true;

            await program.methods
                .setModelStatus(modelIdWrapper, version, false)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            config = await program.account.config.fetch(configPda);
            model = config.models.find(
                (m: any) =>
                    Buffer.from(m.modelId[0]).equals(Buffer.from(modelId)) &&
                    m.version === version
            );
            expect(model.enabled).to.be.false;
        });
    });

    describe("Max Staleness", () => {
        it("sets max staleness", async () => {
            const maxStalenessSecs = new BN(7200);
            await program.methods
                .setMaxStaleness(maxStalenessSecs)
                .accounts({
                    config: configPda,
                    admin: newAdmin.publicKey,
                })
                .signers([newAdmin])
                .rpc();

            const config = await program.account.config.fetch(configPda);
            expect(config.maxStalenessSecs.toNumber()).to.equal(maxStalenessSecs.toNumber());
        });
    });
});
