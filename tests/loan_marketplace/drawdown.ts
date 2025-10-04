import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createMint,
    createAssociatedTokenAccount,
    mintTo,
    getAccount,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { expect } from "chai";
import { LoansMarketplace } from "../../target/types/loans_marketplace";

describe("loans_marketplace — drawdown", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.LoansMarketplace as Program<LoansMarketplace>;

    let usdcMint: PublicKey;
    let configPda: PublicKey;

    const now = () => Math.floor(Date.now() / 1000);

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    before(async () => {
        const payer = (provider.wallet as any).payer;
        [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);

        const existing = await program.account.config.fetchNullable(configPda);
        if (existing) {
            usdcMint = existing.usdcMint as PublicKey;
            return;
        }

        usdcMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
        await program.methods
            .initializeConfig(500)
            .accountsPartial({
                admin: provider.wallet.publicKey,
                usdcMint,
            })
            .rpc();
    });

    it("fails drawdown unless loan is in Funded state", async () => {
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 1);

        const loanId = new BN(Date.now());
        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const amount = new BN(1_000_000);
        const termSecs = new BN(30 * 86_400);
        const maxAprBps = 1200;
        const minCollateralBps = 2000;
        const fundingDeadline = new BN(now() + 3 * 86_400);

        await program.methods
            .createLoanRequest(loanId, amount, termSecs, maxAprBps, minCollateralBps, fundingDeadline)
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint,
            })
            .signers([borrower])
            .rpc();

        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);
        const borrowerAta = await getAssociatedTokenAddress(usdcMint, borrower.publicKey);

        // Loan is still in Funding state; drawdown should fail with InvalidState
        try {
            await program.methods
                .drawdown()
                .accountsPartial({
                    borrower: borrower.publicKey,
                    loan: loanPda,
                    usdcMint,
                    loanEscrowAta,
                    borrowerAta,
                })
                .signers([borrower])
                .rpc();
            expect.fail("Expected InvalidState error");
        } catch (err) {
            expect(String(err)).to.include("InvalidState");
        }
    });

    it("succeeds drawdown after loan is fully funded", async () => {
        // Create borrower and loan
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 2);

        const loanId = new BN(Date.now() + Math.random() * 1000);
        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const amount = new BN(1_000_000_000); // 1000 USDC
        const termSecs = new BN(30 * 86_400);
        const maxAprBps = 1200;
        const minCollateralBps = 2000;
        const fundingDeadline = new BN(now() + 7 * 86_400);

        await program.methods
            .createLoanRequest(
                loanId,
                amount,
                termSecs,
                maxAprBps,
                minCollateralBps,
                fundingDeadline
            )
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower])
            .rpc();

        // Setup lender and fund the loan
        const lender = anchor.web3.Keypair.generate();
        await airdrop(lender.publicKey);
        const lenderAta = await createAssociatedTokenAccount(
            provider.connection,
            lender,
            usdcMint,
            lender.publicKey
        );
        const payer = (provider.wallet as any).payer;
        await mintTo(provider.connection, lender, usdcMint, lenderAta, payer, amount.toNumber());

        const [loanSignerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);
        const [lenderSharePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender.publicKey.toBuffer()],
            program.programId
        );

        // Fund the loan
        await program.methods
            .lenderFund(amount)
            .accountsStrict({
                config: configPda,
                lender: lender.publicKey,
                loan: loanPda,
                loanSigner: loanSignerPda,
                lenderAta,
                loanEscrowAta,
                lenderShare: lenderSharePda,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([lender])
            .rpc();

        // Verify loan is funded
        let loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(2); // Funded

        // Check escrow balance before drawdown
        const escrowBefore = await getAccount(provider.connection, loanEscrowAta);
        expect(escrowBefore.amount.toString()).to.equal(amount.toString());

        // Create borrower ATA
        const borrowerAta = await getAssociatedTokenAddress(usdcMint, borrower.publicKey);

        // Drawdown
        await program.methods
            .drawdown()
            .accountsPartial({
                borrower: borrower.publicKey,
                loan: loanPda,
                usdcMint,
                loanEscrowAta,
                borrowerAta,
            })
            .signers([borrower])
            .rpc();

        // Verify loan state changed to Drawn
        loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(3); // Drawn
        expect(loan.startTs.toNumber()).to.be.greaterThan(0);
        expect(loan.dueTs.toNumber()).to.be.greaterThan(loan.startTs.toNumber());
        expect(loan.dueTs.toNumber()).to.equal(loan.startTs.toNumber() + loan.termSecs.toNumber());

        // Verify borrower received funds
        const borrowerBalance = await getAccount(provider.connection, borrowerAta);
        expect(borrowerBalance.amount.toString()).to.equal(amount.toString());

        // Verify escrow is empty
        const escrowAfter = await getAccount(provider.connection, loanEscrowAta);
        expect(escrowAfter.amount.toString()).to.equal("0");
    });

    it("fails drawdown by non-borrower", async () => {
        // Create and fund a loan
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 2);

        const loanId = new BN(Date.now() + Math.random() * 1000);
        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const amount = new BN(1_000_000_000);
        const termSecs = new BN(30 * 86_400);
        const maxAprBps = 1200;
        const minCollateralBps = 2000;
        const fundingDeadline = new BN(now() + 7 * 86_400);

        await program.methods
            .createLoanRequest(
                loanId,
                amount,
                termSecs,
                maxAprBps,
                minCollateralBps,
                fundingDeadline
            )
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower])
            .rpc();

        // Fund the loan
        const lender = anchor.web3.Keypair.generate();
        await airdrop(lender.publicKey);
        const lenderAta = await createAssociatedTokenAccount(
            provider.connection,
            lender,
            usdcMint,
            lender.publicKey
        );
        const payer = (provider.wallet as any).payer;
        await mintTo(provider.connection, lender, usdcMint, lenderAta, payer, amount.toNumber());

        const [loanSignerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);
        const [lenderSharePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .lenderFund(amount)
            .accountsStrict({
                config: configPda,
                lender: lender.publicKey,
                loan: loanPda,
                loanSigner: loanSignerPda,
                lenderAta,
                loanEscrowAta,
                lenderShare: lenderSharePda,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([lender])
            .rpc();

        // Try drawdown as someone else
        const attacker = anchor.web3.Keypair.generate();
        await airdrop(attacker.publicKey, 1);
        const attackerAta = await getAssociatedTokenAddress(usdcMint, attacker.publicKey);

        try {
            await program.methods
                .drawdown()
                .accountsPartial({
                    borrower: attacker.publicKey,
                    loan: loanPda,
                    usdcMint,
                    loanEscrowAta,
                    borrowerAta: attackerAta,
                })
                .signers([attacker])
                .rpc();
            expect.fail("Should have failed - not the borrower");
        } catch (error) {
            expect(error.toString()).to.satisfy((msg: string) =>
                msg.includes("ConstraintHasOne") || msg.includes("has_one")
            );
        }
    });
});


