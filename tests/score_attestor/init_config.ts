import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import { ScoreAttestor } from "../../target/types/score_attestor";

describe("score_attestor — initialize_config", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ScoreAttestor as Program<ScoreAttestor>;

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    it("initializes config successfully with valid parameters", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        const oracleThreshold = 3;
        const maxStalenessSecs = new BN(3600); // 1 hour

        const tx = await program.methods
            .initializeConfig(oracleThreshold, maxStalenessSecs)
            .accountsPartial({
                config: configPda,
                admin: admin.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        // Verify config account was created
        const config = await program.account.config.fetch(configPda);
        expect(config.admin.equals(admin.publicKey)).to.be.true;
        expect(config.bump).to.be.a('number');
        expect(config.paused).to.be.false;
        expect(config.oracleThreshold).to.equal(oracleThreshold);
        expect(config.maxStalenessSecs.toString()).to.equal(maxStalenessSecs.toString());
        expect(config.oracles).to.be.an('array').that.is.empty;
        expect(config.models).to.be.an('array').that.is.empty;

        // Verify event was emitted - check for the actual log format
        const logs = await provider.connection.getParsedTransaction(tx, { commitment: 'confirmed' });
        const logMessages = logs?.meta?.logMessages || [];
        const hasConfigEvent = logMessages.some((log: string) =>
            log.includes('ConfigInitialized') || log.includes('Program data:')
        );
        expect(hasConfigEvent).to.be.true;
    });

    it("fails with zero oracle threshold", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 1);

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        try {
            await program.methods
                .initializeConfig(0, new BN(3600))
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([admin])
                .rpc();

            expect.fail('Expected an error but none was thrown');
        } catch (err) {
            const errorMsg = err.toString();
            expect(errorMsg).to.include('InvalidOracleThreshold');
        }
    });

    it("fails with zero max staleness", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 1);

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        try {
            await program.methods
                .initializeConfig(3, new BN(0))
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([admin])
                .rpc();

            expect.fail('Expected an error but none was thrown');
        } catch (err) {
            const errorMsg = err.toString();
            expect(errorMsg).to.include('InvalidMaxStaleness');
        }
    });

    it("fails with negative max staleness", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 1);

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        try {
            await program.methods
                .initializeConfig(3, new BN(-1))
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([admin])
                .rpc();

            expect.fail('Expected an error but none was thrown');
        } catch (err) {
            const errorMsg = err.toString();
            expect(errorMsg).to.include('InvalidMaxStaleness');
        }
    });

    it("fails if config account already exists", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        // Check if config already exists from previous test
        const existingConfig = await program.account.config.fetchNullable(configPda);
        if (existingConfig) {
            // If it exists, try to initialize again - should fail
            try {
                await program.methods
                    .initializeConfig(3, new BN(3600))
                    .accountsPartial({
                        config: configPda,
                        admin: admin.publicKey,
                        systemProgram: anchor.web3.SystemProgram.programId,
                    })
                    .signers([admin])
                    .rpc();

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(errorMsg).to.include('already in use');
            }
        } else {
            // If it doesn't exist, create it first then try again
            await program.methods
                .initializeConfig(2, new BN(1800))
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([admin])
                .rpc();

            // Second initialization should fail
            try {
                await program.methods
                    .initializeConfig(3, new BN(3600))
                    .accountsPartial({
                        config: configPda,
                        admin: admin.publicKey,
                        systemProgram: anchor.web3.SystemProgram.programId,
                    })
                    .signers([admin])
                    .rpc();

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(errorMsg).to.include('already in use');
            }
        }
    });

    it("fails if admin is not a signer", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 1);

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        try {
            await program.methods
                .initializeConfig(3, new BN(3600))
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc(); // No signers array

            expect.fail('Expected an error but none was thrown');
        } catch (err) {
            const errorMsg = err.toString();
            expect(errorMsg).to.include('Signature verification failed');
        }
    });
});