import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import { ScoreAttestor } from "../../target/types/score_attestor";

describe("score_attestor — post_scoreattestation", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ScoreAttestor as Program<ScoreAttestor>;

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    function toModelIdBuffer(m: any): Buffer {
        const idObj = m.modelId ?? m;
        if (Array.isArray(idObj?.["0"])) return Buffer.from(idObj["0"]);
        if (Array.isArray(idObj)) return Buffer.from(idObj);
        if (idObj instanceof Uint8Array) return Buffer.from(idObj);
        throw new Error("Unexpected ModelId shape");
    }

    async function setupConfig(admin: anchor.web3.Keypair, oracleThreshold = 3) {
        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config")],
            program.programId
        );

        await program.methods
            .initializeConfig(oracleThreshold, new BN(3600))
            .accountsPartial({
                config: configPda,
                admin: admin.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        // Ensure admin is an oracle
        let cfg = await program.account.config.fetch(configPda);
        if (!cfg.oracles.some((o: PublicKey) => o.equals(admin.publicKey))) {
            await program.methods
                .addOracle(admin.publicKey)
                .accountsPartial({ config: configPda, admin: admin.publicKey })
                .signers([admin])
                .rpc();
            cfg = await program.account.config.fetch(configPda);
        }

        // Create controlled oracle keypairs we can sign with to meet threshold
        const oracleKeypairs: anchor.web3.Keypair[] = [];
        const neededAdditional = Math.max(0, (cfg.oracleThreshold as number) - 1); // minus admin
        while (oracleKeypairs.length < neededAdditional) {
            const kp = anchor.web3.Keypair.generate();
            await airdrop(kp.publicKey, 1);
            await program.methods
                .addOracle(kp.publicKey)
                .accountsPartial({ config: configPda, admin: admin.publicKey })
                .signers([admin])
                .rpc();
            oracleKeypairs.push(kp);
        }

        // Ensure a model exists and is enabled (id = 0x01.., version = 1)
        cfg = await program.account.config.fetch(configPda);
        const modelIdBytes = new Uint8Array(32).fill(1);
        const modelExists = cfg.models.some((m: any) => m.version === 1 && toModelIdBuffer(m).equals(Buffer.from(modelIdBytes)));
        if (!modelExists) {
            await program.methods
                .addModel({ 0: Array.from(modelIdBytes) }, 1)
                .accountsPartial({ config: configPda, admin: admin.publicKey })
                .signers([admin])
                .rpc();
        }

        return { configPda, modelIdBytes, modelVersion: 1, oracleKeypairs };
    }

    function buildRemainingFromControlled(
        admin: anchor.web3.Keypair,
        oracleKeypairs: anchor.web3.Keypair[],
        count: number
    ) {
        const pubs: PublicKey[] = [admin.publicKey, ...oracleKeypairs.map(k => k.publicKey)];
        const selected = pubs.slice(0, count);
        return selected.map(pubkey => ({ pubkey, isSigner: true, isWritable: false }));
    }

    async function postScore(
        admin: anchor.web3.Keypair,
        subject: PublicKey,
        loan: PublicKey,
        args: {
            score: number;
            grade: number;
            pdBps: number;
            recMinCollateralBps: number;
            expiryTs: number;
            modelIdBytes?: Uint8Array;
            modelVersion?: number;
            featureCommitmentBytes?: Uint8Array;
            oracleSignerCount?: number;
            prepared?: {
                configPda: PublicKey;
                modelIdBytes: Uint8Array;
                modelVersion: number;
                oracleKeypairs: anchor.web3.Keypair[];
            };
        }
    ) {
        const prep = args.prepared || (await setupConfig(admin));
        const { configPda, modelIdBytes, modelVersion, oracleKeypairs } = prep;

        const modelId = args.modelIdBytes ?? modelIdBytes;
        const version = args.modelVersion ?? modelVersion;
        const featureCommitment = args.featureCommitmentBytes ?? new Uint8Array(32).fill(7);

        const [scorePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score"), subject.toBuffer(), loan.toBuffer()],
            program.programId
        );

        const cfg = await program.account.config.fetch(configPda);
        const threshold = cfg.oracleThreshold as number;
        const needed = args.oracleSignerCount ?? threshold;

        const remaining = buildRemainingFromControlled(admin, oracleKeypairs, needed);
        const signers: anchor.web3.Keypair[] = [admin, ...oracleKeypairs.slice(0, Math.max(0, needed - 1))];

        const tx = await program.methods
            .postScoreAttestation(
                { 0: Array.from(modelId) },
                version,
                { 0: Array.from(featureCommitment) },
                args.score,
                args.grade,
                args.pdBps,
                args.recMinCollateralBps,
                new BN(args.expiryTs),
                admin.publicKey
            )
            .accountsPartial({
                config: configPda,
                subject,
                loan,
                poster: admin.publicKey,
                score: scorePda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .remainingAccounts(remaining)
            .signers(signers)
            .rpc();

        return { scorePda, configPda, tx, prep };
    }

    it("posts score successfully and populates account + emits event", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;

        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + 3600;

        const setup = await setupConfig(admin);

        const { scorePda, tx } = await postScore(admin, subject, loan, {
            score: 720,
            grade: 2,
            pdBps: 450,
            recMinCollateralBps: 1500,
            expiryTs,
            prepared: setup,
        });

        const scoreAcc = await program.account.scoreAttestation.fetch(scorePda);

        expect(scoreAcc.subject.equals(subject)).to.be.true;
        expect(scoreAcc.loan.equals(loan)).to.be.true;
        expect(scoreAcc.score).to.equal(720);
        expect(scoreAcc.grade).to.equal(2);
        expect(scoreAcc.pdBps).to.equal(450);
        expect(scoreAcc.recommendedMinCollateralBps).to.equal(1500);
        expect(scoreAcc.issuer.equals(admin.publicKey)).to.be.true;
        expect(scoreAcc.expiryTs.toNumber()).to.equal(expiryTs);
        expect(scoreAcc.revoked).to.be.false;
        expect(typeof scoreAcc.bump).to.equal("number");
        expect(scoreAcc.postedAt.toNumber()).to.be.greaterThan(0);

        const txDetails = await provider.connection.getTransaction(tx, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });

        const logs = txDetails?.meta?.logMessages || [];
        const hasEvent =
            logs.some((l: string) => l.includes("Program data:")) ||
            logs.some((l: string) => l.includes("ScorePosted")) ||
            logs.some((l: string) =>
                l.includes("score_attestor::event::ScorePosted")
            );

        expect(hasEvent).to.be.true;
    });

    it("fails when program is paused", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const setup = await setupConfig(admin);

        await program.methods
            .setPaused(true)
            .accountsPartial({ config: setup.configPda, admin: admin.publicKey })
            .signers([admin])
            .rpc();

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);

        try {
            await postScore(admin, subject, loan, {
                score: 700,
                grade: 3,
                pdBps: 500,
                recMinCollateralBps: 1200,
                expiryTs: now + 3600,
                prepared: setup,
            });
            expect.fail("Expected Paused error");
        } catch (err) {
            expect(err.toString()).to.include("Paused");
        } finally {
            await program.methods
                .setPaused(false)
                .accountsPartial({ config: setup.configPda, admin: admin.publicKey })
                .signers([admin])
                .rpc();
        }
    });

    it("fails with insufficient oracle signers", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);

        try {
            await postScore(admin, subject, loan, {
                score: 710,
                grade: 2,
                pdBps: 400,
                recMinCollateralBps: 1100,
                expiryTs: now + 3600,
                oracleSignerCount: 1,
            });
            expect.fail("Expected InsufficientOracleSigners error");
        } catch (err) {
            expect(err.toString()).to.include("InsufficientOracleSigners");
        }
    });

    it("fails when model is not allowed", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);

        const setup = await setupConfig(admin);

        const cfg = await program.account.config.fetch(setup.configPda);
        for (const m of cfg.models) {
            await program.methods
                .setModelStatus({ 0: Array.from(toModelIdBuffer(m)) }, m.version, false)
                .accountsPartial({ config: setup.configPda, admin: admin.publicKey })
                .signers([admin])
                .rpc();
        }

        const badModelId = new Uint8Array(32).fill(9);

        try {
            await postScore(admin, subject, loan, {
                score: 730,
                grade: 3,
                pdBps: 480,
                recMinCollateralBps: 1300,
                expiryTs: now + 3600,
                modelIdBytes: badModelId,
                modelVersion: 1,
                prepared: setup,
            });
            expect.fail("Expected ModelNotAllowed error");
        } catch (err) {
            expect(err.toString()).to.include("ModelNotAllowed");
        }
    });

    it("fails with invalid expiry (<= now)", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);

        try {
            await postScore(admin, subject, loan, {
                score: 700,
                grade: 2,
                pdBps: 500,
                recMinCollateralBps: 1000,
                expiryTs: now,
            });
            expect.fail("Expected InvalidExpiry error");
        } catch (err) {
            expect(err.toString()).to.include("InvalidExpiry");
        }

        try {
            await postScore(admin, subject, loan, {
                score: 700,
                grade: 2,
                pdBps: 500,
                recMinCollateralBps: 1000,
                expiryTs: now - 1,
            });
            expect.fail("Expected InvalidExpiry error");
        } catch (err) {
            expect(err.toString()).to.include("InvalidExpiry");
        }
    });

    it("re-post updates the same PDA (init_if_needed)", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);

        const setup = await setupConfig(admin);

        const first = await postScore(admin, subject, loan, {
            score: 720,
            grade: 2,
            pdBps: 450,
            recMinCollateralBps: 1500,
            expiryTs: now + 3600,
            prepared: setup,
        });
        const before = await program.account.scoreAttestation.fetch(first.scorePda);

        await postScore(admin, subject, loan, {
            score: 800,
            grade: 1,
            pdBps: 300,
            recMinCollateralBps: 900,
            expiryTs: now + 7200,
            prepared: setup,
        });

        const after = await program.account.scoreAttestation.fetch(first.scorePda);
        expect(after.score).to.equal(800);
        expect(after.grade).to.equal(1);
        expect(after.pdBps).to.equal(300);
        expect(after.recommendedMinCollateralBps).to.equal(900);
        expect(after.expiryTs.toNumber()).to.equal(now + 7200);
        expect(before.subject.equals(after.subject)).to.be.true;
        expect(before.loan.equals(after.loan)).to.be.true;
    });
});