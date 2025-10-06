import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import { ScoreAttestor } from "../../target/types/score_attestor";

describe("score_attestor — admin_score", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ScoreAttestor as Program<ScoreAttestor>;

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    async function setupConfig(admin: anchor.web3.Keypair) {
        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        // Check if config exists, create if not
        const existingConfig = await program.account.config.fetchNullable(configPda);
        if (!existingConfig) {
            // Create config matching canonical defaults used elsewhere
            await program.methods
                .initializeConfig(3, new BN(3600))
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([admin])
                .rpc();
        }

        // Now fetch the config
        let config = await program.account.config.fetch(configPda);

        // Check if admin is already an oracle
        if (!config.oracles.some(addr => addr.equals(admin.publicKey))) {
            await program.methods
                .addOracle(admin.publicKey)
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                })
                .signers([admin])
                .rpc();

            // Refresh config after adding oracle
            config = await program.account.config.fetch(configPda);
        }

        // Add additional oracles to meet the threshold requirement
        while (config.oracles.length < config.oracleThreshold) {
            const additionalOracle = anchor.web3.Keypair.generate();
            await airdrop(additionalOracle.publicKey, 1);

            await program.methods
                .addOracle(additionalOracle.publicKey)
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                })
                .signers([admin])
                .rpc();

            // Refresh config after adding oracle
            config = await program.account.config.fetch(configPda);
        }

        // Check if model exists
        const modelId = new Uint8Array(32).fill(1);
        const modelExists = config.models.some(m =>
            m.modelId[0].every((byte, index) => byte === modelId[index]) && m.version === 1
        );

        if (!modelExists) {
            await program.methods
                .addModel({ 0: Array.from(modelId) }, 1)
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                })
                .signers([admin])
                .rpc();
        }

        return configPda;
    }

    async function createScoreAttestation(
        admin: anchor.web3.Keypair,
        subject: PublicKey,
        loan: PublicKey,
        score: number,
        grade: number,
        pdBps: number,
        recommendedMinCollateralBps: number,
        expiryTs: number
    ) {
        const [scorePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score"), subject.toBuffer(), loan.toBuffer()],
            program.programId
        );

        // Use the same modelId that was added to config
        const modelId = new Uint8Array(32).fill(1);
        const modelVersion = 1;

        // Create a mock feature commitment (32 bytes)
        const featureCommitment = new Uint8Array(32).fill(1);

        // Get config to check oracle threshold
        const configPda = await setupConfig(admin);
        const config = await program.account.config.fetch(configPda);

        // Create oracle signers from newly created oracle keypairs we control
        // Ensure we have oracleThreshold distinct signers available
        const oracleKeypairs: anchor.web3.Keypair[] = [];
        // If admin is an oracle, include admin first
        if (config.oracles.some(o => o.equals(admin.publicKey))) {
            oracleKeypairs.push(admin);
        }
        while (oracleKeypairs.length < config.oracleThreshold) {
            const kp = anchor.web3.Keypair.generate();
            await airdrop(kp.publicKey, 1);
            await program.methods
                .addOracle(kp.publicKey)
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                })
                .signers([admin])
                .rpc();
            oracleKeypairs.push(kp);
        }
        const oracleSigners = oracleKeypairs.map(kp => ({
            pubkey: kp.publicKey,
            isSigner: true,
            isWritable: false,
        }));

        const tx = await program.methods
            .postScoreAttestation(
                { 0: Array.from(modelId) },
                modelVersion,
                { 0: Array.from(featureCommitment) },
                score,
                grade,
                pdBps,
                recommendedMinCollateralBps,
                new BN(expiryTs),
                admin.publicKey
            )
            .accountsPartial({
                config: configPda,
                subject: subject,
                loan: loan,
                poster: admin.publicKey,
                score: scorePda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .remainingAccounts(oracleSigners)
            .signers([admin, ...oracleKeypairs])
            .rpc();

        return { scorePda, tx };
    }

    describe("revoke_attestation", () => {
        it("successfully revokes an attestation", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const expiryTs = now + 3600; // 1 hour from now

            // Create score attestation first
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                expiryTs
            );

            // Verify attestation exists and is not revoked
            const scoreBefore = await program.account.scoreAttestation.fetch(scorePda);
            expect(scoreBefore.revoked).to.be.false;

            // Revoke the attestation
            const tx = await program.methods
                .revokeAttestation()
                .accountsPartial({
                    config: await setupConfig(admin),
                    admin: admin.publicKey,
                    subject: subject,
                    loan: loan,
                    score: scorePda,
                })
                .signers([admin])
                .rpc();

            // Verify attestation is now revoked
            const scoreAfter = await program.account.scoreAttestation.fetch(scorePda);
            expect(scoreAfter.revoked).to.be.true;

            // Verify event was emitted
            const logs = await provider.connection.getParsedTransaction(tx, { commitment: 'confirmed' });
            const logMessages = logs?.meta?.logMessages || [];
            const hasRevokeEvent = logMessages.some((log: string) =>
                log.includes('ScoreRevoked') || log.includes('Program data:')
            );
            expect(hasRevokeEvent).to.be.true;
        });

        it("fails if admin is not the config admin", async () => {
            const admin = anchor.web3.Keypair.generate();
            const nonAdmin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);
            await airdrop(nonAdmin.publicKey, 1);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const expiryTs = now + 3600;

            // Create score attestation with admin
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                expiryTs
            );

            // Try to revoke with non-admin (this will fail due to has_one constraint)
            try {
                await program.methods
                    .revokeAttestation()
                    .accountsPartial({
                        config: await setupConfig(admin), // Ensure config exists for admin
                        admin: nonAdmin.publicKey, // But we're trying to use nonAdmin
                        subject: subject,
                        loan: loan,
                        score: scorePda,
                    })
                    .signers([nonAdmin])
                    .rpc();

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(
                    errorMsg.includes('ConstraintHasOne') || errorMsg.includes('ConstraintSeeds')
                ).to.equal(true);
            }
        });

        it("fails if admin is not a signer", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const expiryTs = now + 3600;

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                expiryTs
            );

            // Try to revoke without signing
            try {
                await program.methods
                    .revokeAttestation()
                    .accountsPartial({
                        config: await setupConfig(admin),
                        admin: admin.publicKey,
                        subject: subject,
                        loan: loan,
                        score: scorePda,
                    })
                    .rpc(); // No signers array

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(errorMsg).to.include('Signature verification failed');
            }
        });
    });

    describe("update_attestation_expiry", () => {
        it("successfully updates attestation expiry", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600; // 1 hour from now
            const newExpiryTs = now + 7200; // 2 hours from now

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Verify original expiry
            const scoreBefore = await program.account.scoreAttestation.fetch(scorePda);
            expect(scoreBefore.expiryTs.toNumber()).to.equal(originalExpiryTs);

            // Update expiry
            const tx = await program.methods
                .updateAttestationExpiry(new BN(newExpiryTs))
                .accountsPartial({
                    config: await setupConfig(admin),
                    admin: admin.publicKey,
                    subject: subject,
                    loan: loan,
                    score: scorePda,
                })
                .signers([admin])
                .rpc();

            // Verify new expiry
            const scoreAfter = await program.account.scoreAttestation.fetch(scorePda);
            expect(scoreAfter.expiryTs.toNumber()).to.equal(newExpiryTs);

            // Verify event was emitted
            const logs = await provider.connection.getParsedTransaction(tx, { commitment: 'confirmed' });
            const logMessages = logs?.meta?.logMessages || [];
            const hasExpiryEvent = logMessages.some((log: string) =>
                log.includes('ScoreExpiryUpdated') || log.includes('Program data:')
            );
            expect(hasExpiryEvent).to.be.true;
        });

        it("fails with invalid expiry (in the past)", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600;
            const invalidExpiryTs = now - 3600; // 1 hour ago

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Try to update with past expiry
            try {
                await program.methods
                    .updateAttestationExpiry(new BN(invalidExpiryTs))
                    .accountsPartial({
                        config: await setupConfig(admin),
                        admin: admin.publicKey,
                        subject: subject,
                        loan: loan,
                        score: scorePda,
                    })
                    .signers([admin])
                    .rpc();

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(errorMsg).to.include('InvalidExpiry');
            }
        });

        it("fails with invalid expiry (current time)", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600;
            const currentTime = now;

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Try to update with current time (should fail as it's not > now)
            try {
                await program.methods
                    .updateAttestationExpiry(new BN(currentTime))
                    .accountsPartial({
                        config: await setupConfig(admin),
                        admin: admin.publicKey,
                        subject: subject,
                        loan: loan,
                        score: scorePda,
                    })
                    .signers([admin])
                    .rpc();

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(errorMsg).to.include('InvalidExpiry');
            }
        });

        it("fails if admin is not the config admin", async () => {
            const admin = anchor.web3.Keypair.generate();
            const nonAdmin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);
            await airdrop(nonAdmin.publicKey, 1);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600;
            const newExpiryTs = now + 7200;

            // Create score attestation with admin
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Try to update with non-admin
            try {
                await program.methods
                    .updateAttestationExpiry(new BN(newExpiryTs))
                    .accountsPartial({
                        config: await setupConfig(admin), // Ensure config exists for admin
                        admin: nonAdmin.publicKey, // But we're trying to use nonAdmin
                        subject: subject,
                        loan: loan,
                        score: scorePda,
                    })
                    .signers([nonAdmin])
                    .rpc();

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(
                    errorMsg.includes('ConstraintHasOne') || errorMsg.includes('ConstraintSeeds')
                ).to.equal(true);
            }
        });

        it("fails if admin is not a signer", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600;
            const newExpiryTs = now + 7200;

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Try to update without signing
            try {
                await program.methods
                    .updateAttestationExpiry(new BN(newExpiryTs))
                    .accountsPartial({
                        config: await setupConfig(admin),
                        admin: admin.publicKey,
                        subject: subject,
                        loan: loan,
                        score: scorePda,
                    })
                    .rpc(); // No signers array

                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                const errorMsg = err.toString();
                expect(errorMsg).to.include('Signature verification failed');
            }
        });

        it("handles edge case with maximum valid expiry", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600;
            const maxExpiryTs = Number.MAX_SAFE_INTEGER;

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Update to maximum expiry
            const tx = await program.methods
                .updateAttestationExpiry(new BN(maxExpiryTs))
                .accountsPartial({
                    config: await setupConfig(admin),
                    admin: admin.publicKey,
                    subject: subject,
                    loan: loan,
                    score: scorePda,
                })
                .signers([admin])
                .rpc();

            // Verify maximum expiry was set
            const scoreAfter = await program.account.scoreAttestation.fetch(scorePda);
            expect(scoreAfter.expiryTs.toNumber()).to.equal(maxExpiryTs);
        });

        it("handles edge case with minimum valid expiry", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600;
            const minExpiryTs = now + 30; // ensure strictly > now with buffer

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Update to minimum valid expiry
            const tx = await program.methods
                .updateAttestationExpiry(new BN(minExpiryTs))
                .accountsPartial({
                    config: await setupConfig(admin),
                    admin: admin.publicKey,
                    subject: subject,
                    loan: loan,
                    score: scorePda,
                })
                .signers([admin])
                .rpc();

            // Verify minimum expiry was set
            const scoreAfter = await program.account.scoreAttestation.fetch(scorePda);
            expect(scoreAfter.expiryTs.toNumber()).to.equal(minExpiryTs);
        });
    });

    describe("integration tests", () => {
        it("can revoke and then update expiry of the same attestation", async () => {
            const admin = anchor.web3.Keypair.generate();
            await airdrop(admin.publicKey, 2);

            const subject = anchor.web3.Keypair.generate().publicKey;
            const loan = anchor.web3.Keypair.generate().publicKey;
            const now = Math.floor(Date.now() / 1000);
            const originalExpiryTs = now + 3600;
            const newExpiryTs = now + 7200;

            // Create score attestation
            const { scorePda } = await createScoreAttestation(
                admin,
                subject,
                loan,
                750,
                3,
                500,
                1000,
                originalExpiryTs
            );

            // Revoke the attestation
            await program.methods
                .revokeAttestation()
                .accountsPartial({
                    config: await setupConfig(admin),
                    admin: admin.publicKey,
                    subject: subject,
                    loan: loan,
                    score: scorePda,
                })
                .signers([admin])
                .rpc();

            // Verify it's revoked
            let score = await program.account.scoreAttestation.fetch(scorePda);
            expect(score.revoked).to.be.true;

            // Update expiry (should still work even if revoked)
            await program.methods
                .updateAttestationExpiry(new BN(newExpiryTs))
                .accountsPartial({
                    config: await setupConfig(admin),
                    admin: admin.publicKey,
                    subject: subject,
                    loan: loan,
                    score: scorePda,
                })
                .signers([admin])
                .rpc();

            // Verify expiry was updated and still revoked
            score = await program.account.scoreAttestation.fetch(scorePda);
            expect(score.expiryTs.toNumber()).to.equal(newExpiryTs);
            expect(score.revoked).to.be.true;
        });
    });
});
