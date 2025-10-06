import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import { ScoreAttestor } from "../../target/types/score_attestor";

describe("score_attestor — integration full cycle", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ScoreAttestor as Program<ScoreAttestor>;

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
    }

    async function setupConfig(admin: anchor.web3.Keypair, oracleThreshold = 3) {
        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config"), admin.publicKey.toBuffer()],
            program.programId
        );

        const existing = await program.account.config.fetchNullable(configPda);
        if (!existing) {
            await program.methods
                .initializeConfig(oracleThreshold, new BN(3600))
                .accountsPartial({
                    config: configPda,
                    admin: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([admin])
                .rpc();
        }

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

        // Add controlled additional oracles
        const oracleKeypairs: anchor.web3.Keypair[] = [];
        const neededAdditional = Math.max(0, (cfg.oracleThreshold as number) - 1);
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
        const modelExists = cfg.models.some((m: any) => m.version === 1 && m.modelId[0].every((b: number, i: number) => b === modelIdBytes[i]));
        if (!modelExists) {
            await program.methods
                .addModel({ 0: Array.from(modelIdBytes) }, 1)
                .accountsPartial({ config: configPda, admin: admin.publicKey })
                .signers([admin])
                .rpc();
        }

        return { configPda, modelIdBytes, modelVersion: 1, oracleKeypairs };
    }

    function buildRemainingFromControlled(admin: anchor.web3.Keypair, oracleKeypairs: anchor.web3.Keypair[], count: number) {
        const pubs: PublicKey[] = [admin.publicKey, ...oracleKeypairs.map(k => k.publicKey)];
        const selected = pubs.slice(0, count);
        return selected.map(pubkey => ({ pubkey, isSigner: true, isWritable: false }));
    }

    async function postScore(
        admin: anchor.web3.Keypair,
        prepared: { configPda: PublicKey; modelIdBytes: Uint8Array; modelVersion: number; oracleKeypairs: anchor.web3.Keypair[] },
        subject: PublicKey,
        loan: PublicKey,
        expiryTs: number,
        override?: { score?: number; grade?: number; pdBps?: number; recMinCollateralBps?: number; oracleSignerCount?: number }
    ) {
        const [scorePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score"), subject.toBuffer(), loan.toBuffer()],
            program.programId
        );
        const cfg = await program.account.config.fetch(prepared.configPda);
        const threshold = cfg.oracleThreshold as number;
        const needed = override?.oracleSignerCount ?? threshold;
        const remaining = buildRemainingFromControlled(admin, prepared.oracleKeypairs, needed);

        const tx = await program.methods
            .postScoreAttestation(
                { 0: Array.from(prepared.modelIdBytes) },
                prepared.modelVersion,
                { 0: Array.from(new Uint8Array(32).fill(7)) },
                override?.score ?? 720,
                override?.grade ?? 2,
                override?.pdBps ?? 450,
                override?.recMinCollateralBps ?? 1500,
                new BN(expiryTs),
                admin.publicKey
            )
            .accountsPartial({
                config: prepared.configPda,
                subject,
                loan,
                poster: admin.publicKey,
                score: scorePda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .remainingAccounts(remaining)
            .signers([admin, ...prepared.oracleKeypairs.slice(0, Math.max(0, needed - 1))])
            .rpc();

        return { scorePda, tx };
    }

    it("happy path: post -> revoke -> update expiry", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);
        const prepared = await setupConfig(admin);

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + 3600;

        const { scorePda } = await postScore(admin, prepared, subject, loan, expiryTs);
        let score = await program.account.scoreAttestation.fetch(scorePda);
        expect(score.revoked).to.be.false;
        expect(score.expiryTs.toNumber()).to.equal(expiryTs);

        await program.methods
            .revokeAttestation()
            .accountsPartial({
                config: prepared.configPda,
                admin: admin.publicKey,
                subject,
                loan,
                score: scorePda,
            })
            .signers([admin])
            .rpc();

        score = await program.account.scoreAttestation.fetch(scorePda);
        expect(score.revoked).to.be.true;

        const newExpiry = now + 7200;
        await program.methods
            .updateAttestationExpiry(new BN(newExpiry))
            .accountsPartial({
                config: prepared.configPda,
                admin: admin.publicKey,
                subject,
                loan,
                score: scorePda,
            })
            .signers([admin])
            .rpc();

        score = await program.account.scoreAttestation.fetch(scorePda);
        expect(score.expiryTs.toNumber()).to.equal(newExpiry);
        expect(score.revoked).to.be.true;
    });

    it("pause blocks post and unpause allows post again", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);
        const prepared = await setupConfig(admin);

        await program.methods
            .setPaused(true)
            .accountsPartial({ config: prepared.configPda, admin: admin.publicKey })
            .signers([admin])
            .rpc();

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);

        try {
            await postScore(admin, prepared, subject, loan, now + 3600);
            expect.fail("Expected Paused error");
        } catch (err) {
            expect(err.toString()).to.include("Paused");
        }

        await program.methods
            .setPaused(false)
            .accountsPartial({ config: prepared.configPda, admin: admin.publicKey })
            .signers([admin])
            .rpc();

        const { scorePda } = await postScore(admin, prepared, subject, loan, now + 7200);
        const score = await program.account.scoreAttestation.fetch(scorePda);
        expect(score.revoked).to.be.false;
    });

    it("re-post overwrites fields in same PDA", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);
        const prepared = await setupConfig(admin);

        const subject = anchor.web3.Keypair.generate().publicKey;
        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);

        const first = await postScore(admin, prepared, subject, loan, now + 3600, { score: 700, grade: 3, pdBps: 500, recMinCollateralBps: 1200 });
        const before = await program.account.scoreAttestation.fetch(first.scorePda);

        await postScore(admin, prepared, subject, loan, now + 7200, { score: 800, grade: 1, pdBps: 300, recMinCollateralBps: 900 });
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
