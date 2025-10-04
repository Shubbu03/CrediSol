import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createMint,
    createAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { expect } from "chai";
import { LoansMarketplace } from "../../target/types/loans_marketplace";

describe("loans_marketplace — finalize_funding", () => {
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

    it("fails to finalize when not sufficiently funded", async () => {
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

        // funded_amount is zero initially; finalize should fail with InsufficientFunding
        try {
            await program.methods
                .finalizeFunding()
                .accountsPartial({
                    loan: loanPda,
                    borrower: borrower.publicKey,
                })
                .rpc();
            expect.fail("Expected InsufficientFunding error");
        } catch (err) {
            expect(String(err)).to.include("InsufficientFunding");
        }
    });

    it("finalizes successfully after manual funding via lender_fund", async () => {
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

        // Setup lender
        const lender = anchor.web3.Keypair.generate();
        await airdrop(lender.publicKey);
        const lenderAta = await createAssociatedTokenAccount(
            provider.connection,
            lender,
            usdcMint,
            lender.publicKey
        );
        const payer = (provider.wallet as any).payer;
        await mintTo(
            provider.connection,
            lender,
            usdcMint,
            lenderAta,
            payer,
            amount.toNumber()
        );

        const [loanSignerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);

        const [lenderSharePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender.publicKey.toBuffer()],
            program.programId
        );

        // Fund the loan fully - this should auto-transition to Funded state
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

        // Verify loan is now in Funded state (auto-finalized by lender_fund)
        const loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.fundedAmount.toString()).to.equal(amount.toString());
        expect(loan.state).to.equal(2); // Funded state
        expect(loan.actualAprBps).to.equal(1200); // Should be set to max_apr_bps
    });

    it("allows manual finalize_funding call when funded_amount >= amount", async () => {
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

        // Setup two lenders to fund partially
        const lender1 = anchor.web3.Keypair.generate();
        const lender2 = anchor.web3.Keypair.generate();
        await airdrop(lender1.publicKey);
        await airdrop(lender2.publicKey);

        const lender1Ata = await createAssociatedTokenAccount(
            provider.connection,
            lender1,
            usdcMint,
            lender1.publicKey
        );
        const lender2Ata = await createAssociatedTokenAccount(
            provider.connection,
            lender2,
            usdcMint,
            lender2.publicKey
        );

        const payer = (provider.wallet as any).payer;
        const partialAmount = new BN(400_000_000);
        await mintTo(provider.connection, lender1, usdcMint, lender1Ata, payer, partialAmount.toNumber());
        await mintTo(provider.connection, lender2, usdcMint, lender2Ata, payer, amount.sub(partialAmount).toNumber());

        const [loanSignerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);

        const [lenderShare1Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender1.publicKey.toBuffer()],
            program.programId
        );

        // Fund partially with lender 1
        await program.methods
            .lenderFund(partialAmount)
            .accountsStrict({
                config: configPda,
                lender: lender1.publicKey,
                loan: loanPda,
                loanSigner: loanSignerPda,
                lenderAta: lender1Ata,
                loanEscrowAta,
                lenderShare: lenderShare1Pda,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([lender1])
            .rpc();

        // Verify still in Funding state
        let loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(1); // Still Funding

        const [lenderShare2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender2.publicKey.toBuffer()],
            program.programId
        );

        // Complete funding with lender 2 - this will auto-finalize
        await program.methods
            .lenderFund(amount.sub(partialAmount))
            .accountsStrict({
                config: configPda,
                lender: lender2.publicKey,
                loan: loanPda,
                loanSigner: loanSignerPda,
                lenderAta: lender2Ata,
                loanEscrowAta,
                lenderShare: lenderShare2Pda,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([lender2])
            .rpc();

        // Verify auto-finalized
        loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.fundedAmount.toString()).to.equal(amount.toString());
        expect(loan.state).to.equal(2); // Funded
        expect(loan.actualAprBps).to.equal(1200);
    });

    it("rejects finalize_funding when loan not in Funding state", async () => {
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 1);

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

        // Fund it fully first
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

        // Now it's in Funded state, try to finalize again
        try {
            await program.methods
                .finalizeFunding()
                .accountsPartial({
                    loan: loanPda,
                    borrower: borrower.publicKey,
                })
                .rpc();
            expect.fail("Should have failed with InvalidState");
        } catch (error) {
            expect(error.toString()).to.include("InvalidState");
        }
    });
});


