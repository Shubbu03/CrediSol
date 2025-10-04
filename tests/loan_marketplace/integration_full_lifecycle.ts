import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createMint,
    createAssociatedTokenAccount,
    mintTo,
    getAccount,
    transfer,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { expect } from "chai";
import { LoansMarketplace } from "../../target/types/loans_marketplace";

describe("loans_marketplace — Full Lifecycle Integration", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.LoansMarketplace as Program<LoansMarketplace>;

    let usdcMint: PublicKey;
    let configPda: PublicKey;
    const DAY_SECONDS = 86_400;
    const LOAN_AMOUNT = new BN(1_000_000_000); // 1000 USDC
    const COLLATERAL_AMOUNT = new BN(200_000_000); // 200 USDC

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

    it("completes full happy path: create → fund → drawdown → repay → settle", async () => {
        // 1. Create loan
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 3);

        const loanId = new BN(Date.now() + Math.random() * 1000);
        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        await program.methods
            .createLoanRequest(
                loanId,
                LOAN_AMOUNT,
                new BN(30 * DAY_SECONDS),
                1200,
                2000,
                new BN(now() + 7 * DAY_SECONDS)
            )
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower])
            .rpc();

        let loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(1); // Funding

        // 2. Fund loan
        const lender = anchor.web3.Keypair.generate();
        await airdrop(lender.publicKey);
        const lenderAta = await createAssociatedTokenAccount(
            provider.connection,
            lender,
            usdcMint,
            lender.publicKey
        );
        const payer = (provider.wallet as any).payer;
        await mintTo(provider.connection, lender, usdcMint, lenderAta, payer, LOAN_AMOUNT.toNumber());

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
            .lenderFund(LOAN_AMOUNT)
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
        loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(2); // Funded

        // 3. Drawdown
        const borrowerAta = await getAssociatedTokenAddress(usdcMint, borrower.publicKey);

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

        // Verify drawdown
        loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(3); // Drawn
        expect(loan.startTs.toNumber()).to.be.greaterThan(0);

        // 4. Add collateral for repayment testing
        const borrowerAtaInfo = await provider.connection.getAccountInfo(borrowerAta);
        if (!borrowerAtaInfo) {
            await createAssociatedTokenAccount(
                provider.connection,
                borrower,
                usdcMint,
                borrower.publicKey
            );
        }
        await mintTo(provider.connection, borrower, usdcMint, borrowerAta, payer, COLLATERAL_AMOUNT.toNumber());
        await transfer(
            provider.connection,
            borrower,
            borrowerAta,
            loanEscrowAta,
            borrower,
            COLLATERAL_AMOUNT.toNumber()
        );

        // Set loan for repayment testing
        await program.methods
            .setLoanForRepaymentTesting()
            .accounts({ loan: loanPda })
            .rpc();

        // 5. Repay loan
        const repayAmount = LOAN_AMOUNT.add(new BN(50_000_000)); // Principal + some interest
        await mintTo(provider.connection, borrower, usdcMint, borrowerAta, payer, repayAmount.toNumber());

        await program.methods
            .repayLoan(repayAmount)
            .accountsStrict({
                loan: loanPda,
                borrower: borrower.publicKey,
                config: configPda,
                loanSigner: loanSignerPda,
                loanEscrowAta,
                borrowerAta,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([borrower])
            .rpc();

        // 6. Verify settlement
        loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(7); // Settled
        expect(loan.outstandingPrincipal.toString()).to.equal("0");
        expect(loan.accruedInterest.toString()).to.equal("0");

        // Verify borrower got collateral back plus kept the original loan amount
        const borrowerBalance = await getAccount(provider.connection, borrowerAta);
        const expectedBalance = LOAN_AMOUNT.add(COLLATERAL_AMOUNT);
        expect(borrowerBalance.amount.toString()).to.equal(expectedBalance.toString());
    });

    it("completes default path: create → fund → drawdown → default → payout", async () => {
        // 1. Create and fund loan
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 3);

        const loanId = new BN(Date.now() + Math.random() * 1000);
        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        await program.methods
            .createLoanRequest(
                loanId,
                LOAN_AMOUNT,
                new BN(30 * DAY_SECONDS),
                1200,
                2000,
                new BN(now() + 7 * DAY_SECONDS)
            )
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower])
            .rpc();

        // Fund with two lenders
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
        const lender1Amount = new BN(300_000_000); // 30%
        const lender2Amount = LOAN_AMOUNT.sub(lender1Amount); // 70%

        await mintTo(provider.connection, lender1, usdcMint, lender1Ata, payer, lender1Amount.toNumber());
        await mintTo(provider.connection, lender2, usdcMint, lender2Ata, payer, lender2Amount.toNumber());

        const [loanSignerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);

        const [lenderShare1Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender1.publicKey.toBuffer()],
            program.programId
        );
        const [lenderShare2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender2.publicKey.toBuffer()],
            program.programId
        );

        // Fund the loan
        await program.methods
            .lenderFund(lender1Amount)
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

        await program.methods
            .lenderFund(lender2Amount)
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

        // 2. Drawdown
        const borrowerAta = await getAssociatedTokenAddress(usdcMint, borrower.publicKey);

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

        // 3. Add collateral and set for default
        const borrowerAtaInfo = await provider.connection.getAccountInfo(borrowerAta);
        if (!borrowerAtaInfo) {
            await createAssociatedTokenAccount(
                provider.connection,
                borrower,
                usdcMint,
                borrower.publicKey
            );
        }
        await mintTo(provider.connection, borrower, usdcMint, borrowerAta, payer, COLLATERAL_AMOUNT.toNumber());
        await transfer(
            provider.connection,
            borrower,
            borrowerAta,
            loanEscrowAta,
            borrower,
            COLLATERAL_AMOUNT.toNumber()
        );

        // Set loan for default testing
        await program.methods
            .setLoanForDefaultTesting(8)
            .accounts({ loan: loanPda })
            .rpc();

        // 4. Mark as default
        await program.methods
            .markDefault()
            .accountsStrict({
                caller: provider.wallet.publicKey,
                loan: loanPda,
                config: configPda,
                loanSigner: loanSignerPda,
                loanEscrowAta,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .rpc();

        // Verify default
        let loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.state).to.equal(6); // Defaulted

        // 5. Payout to lenders
        const lender1BalanceBefore = await getAccount(provider.connection, lender1Ata);
        const lender2BalanceBefore = await getAccount(provider.connection, lender2Ata);

        // Payout lender1
        await program.methods
            .payoutToLenders()
            .accountsPartial({
                lender: lender1.publicKey,
                loan: loanPda,
                lenderShare: lenderShare1Pda,
                usdcMint,
                collateralEscrowAta: loanEscrowAta,
                lenderAta: lender1Ata,
            })
            .signers([lender1])
            .rpc();

        // Payout lender2
        await program.methods
            .payoutToLenders()
            .accountsPartial({
                lender: lender2.publicKey,
                loan: loanPda,
                lenderShare: lenderShare2Pda,
                usdcMint,
                collateralEscrowAta: loanEscrowAta,
                lenderAta: lender2Ata,
            })
            .signers([lender2])
            .rpc();

        // Verify payouts
        const lender1BalanceAfter = await getAccount(provider.connection, lender1Ata);
        const lender2BalanceAfter = await getAccount(provider.connection, lender2Ata);

        const lender1Received = BigInt(lender1BalanceAfter.amount.toString()) - BigInt(lender1BalanceBefore.amount.toString());
        const lender2Received = BigInt(lender2BalanceAfter.amount.toString()) - BigInt(lender2BalanceBefore.amount.toString());

        // Lender1 should get 30% of collateral
        const expectedLender1Payout = (BigInt(COLLATERAL_AMOUNT.toString()) * BigInt(3000)) / BigInt(10000);
        // Lender2 should get 70% of collateral
        const expectedLender2Payout = (BigInt(COLLATERAL_AMOUNT.toString()) * BigInt(7000)) / BigInt(10000);

        expect(lender1Received).to.equal(expectedLender1Payout);
        expect(lender2Received).to.equal(expectedLender2Payout);

        // Verify total payout equals collateral
        const totalPayout = lender1Received + lender2Received;
        expect(totalPayout).to.equal(BigInt(COLLATERAL_AMOUNT.toString()));
    });

    it("handles multiple loans simultaneously", async () => {
        // Create two separate loans
        const borrower1 = anchor.web3.Keypair.generate();
        const borrower2 = anchor.web3.Keypair.generate();
        await airdrop(borrower1.publicKey, 2);
        await airdrop(borrower2.publicKey, 2);

        const loanId1 = new BN(Date.now() + Math.random() * 1000);
        const loanId2 = new BN(Date.now() + Math.random() * 1000);

        const [loanPda1] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower1.publicKey.toBuffer(), loanId1.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const [loanPda2] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower2.publicKey.toBuffer(), loanId2.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        // Create both loans
        await program.methods
            .createLoanRequest(
                loanId1,
                LOAN_AMOUNT,
                new BN(30 * DAY_SECONDS),
                1200,
                2000,
                new BN(now() + 7 * DAY_SECONDS)
            )
            .accountsPartial({
                borrower: borrower1.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower1])
            .rpc();

        await program.methods
            .createLoanRequest(
                loanId2,
                LOAN_AMOUNT,
                new BN(30 * DAY_SECONDS),
                1200,
                2000,
                new BN(now() + 7 * DAY_SECONDS)
            )
            .accountsPartial({
                borrower: borrower2.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower2])
            .rpc();

        // Fund both loans
        const lender = anchor.web3.Keypair.generate();
        await airdrop(lender.publicKey);
        const lenderAta = await createAssociatedTokenAccount(
            provider.connection,
            lender,
            usdcMint,
            lender.publicKey
        );
        const payer = (provider.wallet as any).payer;
        await mintTo(provider.connection, lender, usdcMint, lenderAta, payer, LOAN_AMOUNT.mul(new BN(2)).toNumber());

        // Fund loan 1
        const [loanSignerPda1] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower1.publicKey.toBuffer(), loanId1.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const loanEscrowAta1 = await getAssociatedTokenAddress(usdcMint, loanSignerPda1, true);
        const [lenderSharePda1] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda1.toBuffer(), lender.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .lenderFund(LOAN_AMOUNT)
            .accountsStrict({
                config: configPda,
                lender: lender.publicKey,
                loan: loanPda1,
                loanSigner: loanSignerPda1,
                lenderAta,
                loanEscrowAta: loanEscrowAta1,
                lenderShare: lenderSharePda1,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([lender])
            .rpc();

        // Fund loan 2
        const [loanSignerPda2] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower2.publicKey.toBuffer(), loanId2.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        const loanEscrowAta2 = await getAssociatedTokenAddress(usdcMint, loanSignerPda2, true);
        const [lenderSharePda2] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda2.toBuffer(), lender.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .lenderFund(LOAN_AMOUNT)
            .accountsStrict({
                config: configPda,
                lender: lender.publicKey,
                loan: loanPda2,
                loanSigner: loanSignerPda2,
                lenderAta,
                loanEscrowAta: loanEscrowAta2,
                lenderShare: lenderSharePda2,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([lender])
            .rpc();

        // Verify both loans are funded
        const loan1 = await program.account.loanAccount.fetch(loanPda1);
        const loan2 = await program.account.loanAccount.fetch(loanPda2);
        expect(loan1.state).to.equal(2); // Funded
        expect(loan2.state).to.equal(2); // Funded

        // Drawdown both loans
        const borrowerAta1 = await getAssociatedTokenAddress(usdcMint, borrower1.publicKey);
        const borrowerAta2 = await getAssociatedTokenAddress(usdcMint, borrower2.publicKey);

        await program.methods
            .drawdown()
            .accountsPartial({
                borrower: borrower1.publicKey,
                loan: loanPda1,
                usdcMint,
                loanEscrowAta: loanEscrowAta1,
                borrowerAta: borrowerAta1,
            })
            .signers([borrower1])
            .rpc();

        await program.methods
            .drawdown()
            .accountsPartial({
                borrower: borrower2.publicKey,
                loan: loanPda2,
                usdcMint,
                loanEscrowAta: loanEscrowAta2,
                borrowerAta: borrowerAta2,
            })
            .signers([borrower2])
            .rpc();

        // Verify both loans are drawn
        const loan1After = await program.account.loanAccount.fetch(loanPda1);
        const loan2After = await program.account.loanAccount.fetch(loanPda2);
        expect(loan1After.state).to.equal(3); // Drawn
        expect(loan2After.state).to.equal(3); // Drawn

        // Verify both borrowers received funds
        const borrower1Balance = await getAccount(provider.connection, borrowerAta1);
        const borrower2Balance = await getAccount(provider.connection, borrowerAta2);
        expect(borrower1Balance.amount.toString()).to.equal(LOAN_AMOUNT.toString());
        expect(borrower2Balance.amount.toString()).to.equal(LOAN_AMOUNT.toString());
    });
});
