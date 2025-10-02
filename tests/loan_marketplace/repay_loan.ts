import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
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

describe("loans_marketplace — repay_loan", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.LoansMarketplace as Program<LoansMarketplace>;

    let usdcMint: PublicKey;
    let configPda: PublicKey;
    let borrower: anchor.web3.Keypair;
    let lender: anchor.web3.Keypair;
    let loanId: BN;
    let loanPda: PublicKey;
    let loanSignerPda: PublicKey;
    let loanEscrowAta: PublicKey;
    let collateralEscrowAta: PublicKey;
    let borrowerAta: PublicKey;

    const now = () => Math.floor(Date.now() / 1000);
    const DAY_SECONDS = 86_400;
    const LOAN_AMOUNT = new BN(1_000_000_000); // 1000 USDC
    const COLLATERAL_AMOUNT = new BN(200_000_000); // 200 USDC
    const PARTIAL_REPAY_AMOUNT = new BN(300_000_000); // 300 USDC

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    async function setupBorrowerWithBalance(balance = new BN(2_000_000_000)) {
        borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey);

        borrowerAta = await createAssociatedTokenAccount(
            provider.connection,
            borrower,
            usdcMint,
            borrower.publicKey
        );

        const payer = (provider.wallet as any).payer;
        await mintTo(
            provider.connection,
            borrower,
            usdcMint,
            borrowerAta,
            payer,
            balance.toNumber()
        );

        return borrowerAta;
    }

    async function setupLender() {
        lender = anchor.web3.Keypair.generate();
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
            LOAN_AMOUNT.add(new BN(100_000_000)).toNumber()
        );

        return lenderAta;
    }

    async function createLoanInRepayment() {
        await setupBorrowerWithBalance();
        const lenderAta = await setupLender();
        loanId = new BN(Date.now() + Math.random() * 1000);
        [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        [loanSignerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);
        collateralEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);
    
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
    
        if (COLLATERAL_AMOUNT.gt(new BN(0))) {
            await transfer(
                provider.connection,
                borrower,
                borrowerAta,
                collateralEscrowAta,
                borrower,
                COLLATERAL_AMOUNT.toNumber()
            );
        }
    
        await program.methods.finalizeFunding()
            .accountsStrict({
                loan: loanPda,
                borrower: borrower.publicKey,
            })
            .rpc();
    
        const loanAfterFinalize = await program.account.loanAccount.fetch(loanPda);
        expect(loanAfterFinalize.state).to.equal(4);
    }

    async function repayLoan(amount: BN) {
        return await program.methods
            .repayLoan(amount)
            .accountsStrict({
                loan: loanPda,
                borrower: borrower.publicKey,
                config: configPda,
                loanSigner: loanSignerPda,
                loanEscrowAta,
                collateralEscrowAta,
                borrowerAta,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([borrower])
            .rpc();
    }

    before(async () => {
        const payer = (provider.wallet as any).payer;
        [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);

        try {
            const existingConfig = await program.account.config.fetch(configPda);
            usdcMint = existingConfig.usdcMint;
        } catch (error) {
            usdcMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
            await program.methods
                .initializeConfig(500) // 5% protocol fee
                .accountsPartial({
                    admin: provider.wallet.publicKey,
                    usdcMint
                })
                .rpc();
        }
    });

    describe("Success Cases", () => {
        it("allows partial loan repayment", async () => {
            await createLoanInRepayment();

            const loanBefore = await program.account.loanAccount.fetch(loanPda);
            const borrowerBalanceBefore = await getAccount(provider.connection, borrowerAta);

            await repayLoan(PARTIAL_REPAY_AMOUNT);

            const loanAfter = await program.account.loanAccount.fetch(loanPda);
            const borrowerBalanceAfter = await getAccount(provider.connection, borrowerAta);

            // Check loan state updated
            expect(loanAfter.totalRepaidPrincipal.gt(loanBefore.totalRepaidPrincipal) ||
                loanAfter.totalRepaidInterest.gt(loanBefore.totalRepaidInterest)).to.be.true;

            // Check borrower balance decreased
            expect(BigInt(borrowerBalanceAfter.amount.toString()))
                .to.equal(BigInt(borrowerBalanceBefore.amount.toString()) - BigInt(PARTIAL_REPAY_AMOUNT.toString()));

            // Loan should still be in InRepayment state (4)
            expect(loanAfter.state).to.equal(4, 'Loan should be in InRepayment state (4)');
        });

        it("allows full loan repayment with collateral return", async () => {
            await createLoanInRepayment();

            const loanBefore = await program.account.loanAccount.fetch(loanPda);
            const borrowerBalanceBefore = await getAccount(provider.connection, borrowerAta);

            // Calculate full repayment amount (principal + interest + buffer)
            const fullAmount = loanBefore.outstandingPrincipal.add(loanBefore.accruedInterest).add(new BN(50_000_000));

            await repayLoan(fullAmount);

            // Get updated states
            const loanAfter = await program.account.loanAccount.fetch(loanPda);
            const borrowerBalanceAfter = await getAccount(provider.connection, borrowerAta);
            const collateralAfter = await getAccount(provider.connection, collateralEscrowAta);

            // The rest remains unchanged
            expect(loanAfter.outstandingPrincipal.toString()).to.equal("0");
            expect(loanAfter.accruedInterest.toString()).to.equal("0");
            expect(loanAfter.state).to.equal(3); // Settled
            expect(BigInt(collateralAfter.amount.toString())).to.equal(BigInt("0"));
        });
    });

    describe("Error Cases", () => {
        it("fails with zero repayment amount", async () => {
            await createLoanInRepayment();

            try {
                await repayLoan(new BN(0));
                expect.fail("Should have failed with zero amount");
            } catch (error) {
                expect(error.error.errorCode.code).to.equal("InvalidParam");
            }
        });

        it("fails when loan not in InRepayment state", async () => {
            // Create a loan but don't finalize funding
            await setupBorrowerWithBalance();
            const lenderAta = await setupLender();

            loanId = new BN(Date.now() + Math.random() * 1000);
            [loanPda] = PublicKey.findProgramAddressSync(
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

            try {
                await repayLoan(PARTIAL_REPAY_AMOUNT);
                expect.fail("Should have failed - loan not in InRepayment state");
            } catch (error) {
                // Check for either ConstraintSeeds or InvalidState error
                expect(["ConstraintSeeds", "InvalidState"]).to.include(error.error.errorCode.code);
            }
        });
    });
});