import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AttestationRegistry } from "../../target/types/attestation_registry";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";

describe("attestation_registry", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const program = anchor.workspace.AttestationRegistry as Program<AttestationRegistry>;

    let admin: anchor.web3.Keypair;
    let configPda: anchor.web3.PublicKey;
    let configBump: number;

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * anchor.web3.LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    before(async () => {
        admin = anchor.web3.Keypair.generate();
        await airdrop(admin.publicKey);
        [configPda, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("attest_config")],
            program.programId
        );
    });

    it("Initializes config", async () => {
        await program.methods
            .initializeConfig(new anchor.BN(3600))
            .accountsStrict({
                config: configPda,
                admin: admin.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.config.fetch(configPda);
        expect(config.admin.toBase58()).to.eq(admin.publicKey.toBase58());
        expect(config.maxExpirySecs.toNumber()).to.eq(3600);
        expect(config.paused).to.eq(false);
        expect(config.schemas.length).to.be.greaterThan(0);
    });

    it("Adds an issuer", async () => {
        const issuer = anchor.web3.Keypair.generate();
        await airdrop(issuer.publicKey);

        await program.methods
            .addIssuer(issuer.publicKey)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.config.fetch(configPda);
        const found = config.issuers.find((i: any) => i.pubkey.equals(issuer.publicKey));
        expect(found).to.not.be.undefined;
        expect(found.enabled).to.eq(true);
    });

    it("Removes an issuer", async () => {
        const issuer = anchor.web3.Keypair.generate();
        await airdrop(issuer.publicKey);

        await program.methods
            .addIssuer(issuer.publicKey)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        await program.methods
            .removeIssuer(issuer.publicKey)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.config.fetch(configPda);
        const exists = config.issuers.find((i: any) => i.pubkey.equals(issuer.publicKey));
        expect(exists).to.be.undefined;
    });

    it("Toggles issuer status", async () => {
        const issuer = anchor.web3.Keypair.generate();
        await airdrop(issuer.publicKey);

        await program.methods
            .addIssuer(issuer.publicKey)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        await program.methods
            .setIssuerStatus(issuer.publicKey, false)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.config.fetch(configPda);
        const found = config.issuers.find((i: any) => i.pubkey.equals(issuer.publicKey));
        expect(found.enabled).to.eq(false);
    });

    it("Adds a schema", async () => {
        const schemaType = { creditHistory: {} };

        await program.methods
            .addSchema(schemaType)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.config.fetch(configPda);
        const schemaNames = config.schemas.map((s: any) => Object.keys(s)[0]);
        expect(schemaNames).to.include("creditHistory");
    });

    it("Changes admin", async () => {
        const newAdmin = anchor.web3.Keypair.generate();
        await airdrop(newAdmin.publicKey);

        await program.methods
            .setAdmin(newAdmin.publicKey)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.config.fetch(configPda);
        expect(config.admin.toBase58()).to.eq(newAdmin.publicKey.toBase58());
        admin = newAdmin;
    });

    it("Sets max expiry", async () => {
        const newMaxExpiry = 7200;

        await program.methods
            .setMaxExpiry(new anchor.BN(newMaxExpiry))
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.config.fetch(configPda);
        expect(config.maxExpirySecs.toNumber()).to.eq(newMaxExpiry);
    });

    it("Pauses and unpauses the registry", async () => {
        await program.methods
            .setPaused(true)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        let config = await program.account.config.fetch(configPda);
        expect(config.paused).to.eq(true);

        await program.methods
            .setPaused(false)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        config = await program.account.config.fetch(configPda);
        expect(config.paused).to.eq(false);
    });

    it("Posts and updates attestation expiry", async () => {
        const subject = anchor.web3.Keypair.generate();
        const issuer = anchor.web3.Keypair.generate();
        const payer = anchor.web3.Keypair.generate();

        await airdrop(subject.publicKey);
        await airdrop(issuer.publicKey);
        await airdrop(payer.publicKey);

        await program.methods
            .addIssuer(issuer.publicKey)
            .accounts({
                config: configPda,
                admin: admin.publicKey,
            })
            .signers([admin])
            .rpc();

        const schemaIdNumber = 0;
        const schemaId = { identityVerified: {} };
        const claimHash = Array(32).fill(1);
        const expiry = new anchor.BN(Math.floor(Date.now() / 1000) + 1800);

        const [attestationPda, _attestationBump] =
            anchor.web3.PublicKey.findProgramAddressSync(
                [
                    Buffer.from("attest"),
                    subject.publicKey.toBuffer(),
                    Uint8Array.of(schemaIdNumber),
                    issuer.publicKey.toBuffer(),
                ],
                program.programId
            );

        await program.methods
            .postAttestation(schemaId, claimHash, expiry, _attestationBump)
            .accountsStrict({
                config: configPda,
                subject: subject.publicKey,
                attestation: attestationPda,
                issuer: issuer.publicKey,
                payer: payer.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([issuer, payer])
            .rpc();

        console.log('Attestation created');

        // Fetch to verify
        const attestationAccount = await program.account.attestation.fetch(attestationPda);
        console.log('Schema ID:', attestationAccount.schemaId);
        console.log('Schema number:', schemaEnumToNumber(attestationAccount.schemaId));

        const newExpiry = Math.floor(Date.now() / 1000) + 3600;

        // Use the same PDA
        await program.methods
            .updateExpiry(new anchor.BN(newExpiry))
            .accountsStrict({
                config: configPda,
                subject: subject.publicKey,
                attestation: attestationPda,
                signer: issuer.publicKey,
            })
            .signers([issuer])
            .rpc();

        const updatedAttestation = await program.account.attestation.fetch(attestationPda);
        expect(updatedAttestation.expiryTs.toNumber()).to.eq(newExpiry);
    });
});

function schemaEnumToNumber(schema: any): number {
    if ("identityVerified" in schema) return 0;
    if ("uniqueness" in schema) return 1;
    if ("sanctionsClear" in schema) return 2;
    if ("incomeBand" in schema) return 3;
    if ("creditHistory" in schema) return 4;
    if ("employmentStatus" in schema) return 5;
    if ("custom" in schema) return 255;
    throw new Error("Unknown schema type");
}