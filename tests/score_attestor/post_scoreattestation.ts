import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import * as secp256k1 from "secp256k1";
import * as sha3 from "js-sha3";
import { Wallet } from "ethers";
import { ScoreAttestor } from "../../target/types/score_attestor";

describe("score_attestor — AI scoring", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ScoreAttestor as Program<ScoreAttestor>;

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    async function initializeConfig(
        admin: anchor.web3.Keypair,
        attestor: PublicKey,
        secp256k1Pubkey: Uint8Array
    ) {
        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score_config")],
            program.programId
        );

        await program.methods
            .initializeConfig(attestor, Array.from(secp256k1Pubkey))
            .accountsPartial({
                config: configPda,
                admin: admin.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        return configPda;
    }

    async function postScoreAttestation(
        attestor: anchor.web3.Keypair,
        configPda: PublicKey,
        subject: PublicKey,
        loan: PublicKey,
        score: number,
        grade: number,
        pdBps: number,
        recMinCollateralBps: number,
        expiryTs: number,
        message: Uint8Array,
        signatureBytes: Uint8Array,
        recoveryId: number
    ) {
        const [scorePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("score"), subject.toBuffer(), loan.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .postScoreAttestation(
                score,
                grade,
                pdBps,
                recMinCollateralBps,
                new BN(expiryTs),
                [...message.slice(0, 32)],
                [...signatureBytes.slice(0, 64)],
                recoveryId,
            )
            .accountsStrict({
                config: configPda,
                subject,
                loan,
                attestor: attestor.publicKey,
                score: scorePda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([attestor])
            .rpc();

        return { scorePda, tx };
    }

    it("fetches Vettor AI score and posts attestation with secp256k1 signature", async () => {
        const admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey, 2);

        const wallet = Wallet.createRandom();
        const secp256k1PrivKey = Buffer.from(wallet.privateKey.slice(2), "hex");
        const secp256k1PubKeyCompressed = secp256k1.publicKeyCreate(secp256k1PrivKey);

        const secp256k1PubKey = secp256k1.publicKeyConvert(secp256k1PubKeyCompressed, false);
        console.log("secp256k1 public:", secp256k1PubKey);

        const attestor = anchor.web3.Keypair.generate();
        await airdrop(attestor.publicKey, 2);

        const subject = anchor.web3.Keypair.generate();
        await airdrop(subject.publicKey, 2);

        const loan = anchor.web3.Keypair.generate().publicKey;
        const now = Math.floor(Date.now() / 1000);
        const expiryTs = now + 3600;

        const configPda = await initializeConfig(admin, attestor.publicKey, secp256k1PubKey);

        async function fetchVettorScore(address: string) {
            const url = "https://www.vettor.dev/api/wallet/analyze";
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status} — ${text}`);
            }
            const data = await res.json() as any;
            return {
                score: data.totalScore,
                grade: data.totalScore > 700 ? 5 : data.totalScore > 500 ? 4 : data.totalScore > 350 ? 3 : data.totalScore > 200 ? 2 : 1,
                pdBps: Math.max(50, Math.min(5000, Math.floor((850 - data.totalScore) * 6))),
            };
        }

        const vettorScore = await fetchVettorScore(subject.publicKey.toBase58());

        const messageData = Buffer.concat([
            subject.publicKey.toBuffer(),
            Buffer.from(vettorScore.score.toString()),
            Buffer.from(now.toString()),
        ]);
        const plaintextHash = Buffer.from(sha3.keccak_256.digest(messageData));
        console.log("Message hash:", Array.from(new Uint8Array(plaintextHash)));

        const sigObj = secp256k1.ecdsaSign(plaintextHash, secp256k1PrivKey);
        const signatureBytes = sigObj.signature;
        const recoveryId = sigObj.recid;
        console.log(sigObj)

        const recoveredPubKey = secp256k1.ecdsaRecover(signatureBytes, recoveryId, plaintextHash, false);
        console.log(Buffer.from(secp256k1PubKey).equals(Buffer.from(recoveredPubKey)));

        const { scorePda, tx } = await postScoreAttestation(
            attestor,
            configPda,
            subject.publicKey,
            loan,
            vettorScore.score,
            vettorScore.grade,
            vettorScore.pdBps,
            500,
            expiryTs,
            new Uint8Array(plaintextHash),
            new Uint8Array(signatureBytes),
            recoveryId
        );

        const scoreAcc = await program.account.scoreAttestation.fetch(scorePda);

        expect(scoreAcc.score).to.equal(vettorScore.score);
        expect(scoreAcc.grade).to.equal(vettorScore.grade);
        expect(scoreAcc.pdBps).to.equal(vettorScore.pdBps);
        expect(scoreAcc.recommendedMinCollateralBps).to.equal(500);
        expect(scoreAcc.expiryTs.toNumber()).to.equal(expiryTs);
        expect(scoreAcc.revoked).to.be.false;

        console.log("Posted attestation with Vettor AI score successfully. TX:", tx);
    });
});