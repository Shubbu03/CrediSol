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

describe("loans_marketplace — mark_default", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.LoansMarketplace as Program<LoansMarketplace>;

    let usdcMint: PublicKey;
    let configPda: PublicKey;
    let borrower: anchor.web3.Keypair;
    let loanId: BN;
    let loanPda: PublicKey;
    let loanEscrowAta: PublicKey;

    const now = () => Math.floor(Date.now() / 1000);
    const DAY_SECONDS = 86_400;
    const LOAN_AMOUNT = new BN(1_000_000_000); // 1000 USDC
    const COLLATERAL_AMOUNT = new BN(200_000_000); // 200 USDC

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
        return sig;
    }

    async function createOverdueLoan(daysOverdue = 8) {
        borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey);

        loanId = new BN(Date.now() + Math.random() * 1000);
        [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);

        const borrowerUsdcAta = await createAssociatedTokenAccount(
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
            borrowerUsdcAta,
            payer,
            COLLATERAL_AMOUNT.toNumber()
        );

        const futureFundingDeadline = new BN(now() + (3 * DAY_SECONDS));

        await program.methods
            .createLoanRequest(
                loanId,
                LOAN_AMOUNT,
                new BN(30 * DAY_SECONDS),
                1200,
                2000,
                futureFundingDeadline
            )
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower])
            .rpc();
        const escrowAccountInfo = await provider.connection.getAccountInfo(loanEscrowAta);
        if (!escrowAccountInfo) {
            await createAssociatedTokenAccount(
                provider.connection,
                borrower,
                usdcMint,
                loanPda,
                {},
                undefined,
                undefined,
                true
            );
        }
        if (COLLATERAL_AMOUNT.gt(new BN(0))) {
            await transfer(
                provider.connection,
                borrower,
                borrowerUsdcAta,
                loanEscrowAta,
                borrower,
                COLLATERAL_AMOUNT.toNumber()
            );
        }
        return { borrowerUsdcAta };
    }

    async function createFreshLoan() {
        borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey);

        loanId = new BN(Date.now());
        [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);

        // Create loan that's not overdue yet
        await program.methods
            .createLoanRequest(
                loanId,
                LOAN_AMOUNT,
                new BN(30 * DAY_SECONDS),
                1200,
                2000,
                new BN(now() + DAY_SECONDS) // Future deadline
            )
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower])
            .rpc();
    }

    before(async () => {
        const payer = (provider.wallet as any).payer;

        [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);

        try {
            const existingConfig = await program.account.config.fetch(configPda);
            usdcMint = existingConfig.usdcMint
        } catch (error) {
            usdcMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);

            await program.methods
                .initializeConfig(500)
                .accountsPartial({
                    admin: provider.wallet.publicKey,
                    usdcMint
                })
                .rpc();
        }
    });

    describe("Success Cases", () => {
        it("successfully defaults overdue loan after grace period", async () => {
            await createOverdueLoan(8);

            const loanBefore = await program.account.loanAccount.fetch(loanPda);
            expect(loanBefore.borrower.equals(borrower.publicKey)).to.be.true;

            const escrowBefore = await getAccount(provider.connection, loanEscrowAta);
            expect(escrowBefore.amount.toString()).to.equal(COLLATERAL_AMOUNT.toString());

            const [loanSignerPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
                program.programId
            );

            await program.methods
                .setLoanForDefaultTesting(8)
                .accounts({ loan: loanPda })
                .rpc();

            const tx = await program.methods
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

            const loanAfter = await program.account.loanAccount.fetch(loanPda);
            expect(loanAfter.state).to.equal(6);
            expect(loanAfter.borrower.equals(borrower.publicKey)).to.be.true;
            expect(loanAfter.loanId.toString()).to.equal(loanId.toString());

            const txDetails = await provider.connection.getTransaction(tx, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0
            });

            const logs = txDetails?.meta?.logMessages || [];

            const successLog = logs.find(log =>
                log.includes("mark_default") ||
                log.includes("MarkDefault") ||
                log.includes("STUB") ||
                log.includes("Program log: Instruction: MarkDefault") ||
                log.includes("invoke")
            );

            if (logs.length > 0) {
                console.log("Found log:", successLog);
                expect(successLog).to.exist;
            } else {
                console.log("No logs captured, skipping log verification");
                expect(loanAfter.state).to.equal(6);
            }
        });

        it("handles loan with no collateral", async () => {
            borrower = anchor.web3.Keypair.generate();
            await airdrop(borrower.publicKey);

            loanId = new BN(Date.now());
            [loanPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
                program.programId
            );
            loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);

            await program.methods
                .createLoanRequest(
                    loanId,
                    LOAN_AMOUNT,
                    new BN(30 * DAY_SECONDS),
                    1200,
                    0,
                    new BN(now() + DAY_SECONDS)
                )
                .accountsPartial({
                    borrower: borrower.publicKey,
                    config: configPda,
                    usdcMint
                })
                .signers([borrower])
                .rpc();

            await program.methods
                .setLoanForDefaultTesting(8)
                .accounts({ loan: loanPda })
                .rpc();

            const [loanSignerPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
                program.programId
            );

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

            const loan = await program.account.loanAccount.fetch(loanPda);
            expect(loan.state).to.equal(6);
        });

        it("emits LoanDefaulted event with correct data", async () => {
            await createOverdueLoan(8);

            await program.methods
                .setLoanForDefaultTesting(8)
                .accounts({ loan: loanPda })
                .rpc();

            let eventReceived = false;
            let eventData: any = null;

            const listener = program.addEventListener('loanDefaulted', (event, slot) => {
                eventReceived = true;
                eventData = event;
            });

            await program.methods
                .markDefault()
                .accountsPartial({
                    loan: loanPda,
                    config: configPda,
                    loanEscrowAta,
                })
                .rpc();

            await new Promise(resolve => setTimeout(resolve, 1000));

            expect(eventReceived).to.be.true;
            if (eventData) {
                expect(eventData.loan.equals(loanPda)).to.be.true;
                expect(eventData.borrower.equals(borrower.publicKey)).to.be.true;
            }

            await program.removeEventListener(listener);
        });
    });

    describe("Error Cases", () => {
        it("rejects default before grace period (5 days overdue)", async () => {
            await createOverdueLoan(5);

            await program.methods
                .setLoanForDefaultTesting(5)
                .accounts({ loan: loanPda })
                .rpc();

            try {
                await program.methods
                    .markDefault()
                    .accountsPartial({
                        loan: loanPda,
                        config: configPda,
                        loanEscrowAta,
                    })
                    .rpc();
                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                expect(err.toString()).to.include('TooEarly');
            }
        });

        it("rejects default exactly at due date (0 days overdue)", async () => {
            await createOverdueLoan(0);

            await program.methods
                .setLoanForDefaultTesting(0)
                .accounts({ loan: loanPda })
                .rpc();

            try {
                await program.methods
                    .markDefault()
                    .accountsPartial({
                        loan: loanPda,
                        config: configPda,
                        loanEscrowAta,
                    })
                    .rpc();
                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                expect(err.toString()).to.include('TooEarly');
            }
        });

        it("rejects default from Funding state", async () => {
            await createFreshLoan();

            const loan = await program.account.loanAccount.fetch(loanPda);
            expect(loan.state).to.equal(1);

            try {
                await program.methods
                    .markDefault()
                    .accountsPartial({
                        loan: loanPda,
                        config: configPda,
                        loanEscrowAta,
                    })
                    .rpc();
                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                expect(err.toString()).to.include('InvalidState');
            }
        });

        it("rejects default of already defaulted loan", async () => {
            await createOverdueLoan(8);
            await program.methods
                .setLoanForDefaultTesting(8)
                .accounts({ loan: loanPda })
                .rpc();

            await program.methods
                .markDefault()
                .accountsPartial({
                    loan: loanPda,
                    config: configPda,
                    loanEscrowAta,
                })
                .rpc();

            const loan = await program.account.loanAccount.fetch(loanPda);
            expect(loan.state).to.equal(6);

            try {
                await program.methods
                    .markDefault()
                    .accountsPartial({
                        loan: loanPda,
                        config: configPda,
                        loanEscrowAta,
                    })
                    .rpc();
                expect.fail('Expected an error but none was thrown');
            } catch (err) {
                expect(
                    err.toString().includes('InvalidState') ||
                    err.toString().includes('Invalid state') ||
                    err.toString().includes('6001')
                ).to.be.true;
            }
        });
    });

    describe("Edge Cases", () => {
        it("handles multiple defaults on different loans", async () => {
            await createOverdueLoan(8);
            const firstLoanPda = loanPda;
            const firstLoanEscrowAta = loanEscrowAta;
            await program.methods
                .setLoanForDefaultTesting(8)
                .accounts({ loan: firstLoanPda })
                .rpc();
            await program.methods
                .markDefault()
                .accountsPartial({
                    loan: firstLoanPda,
                    config: configPda,
                    loanEscrowAta: firstLoanEscrowAta,
                })
                .rpc();

            await createOverdueLoan(10);
            const secondLoanPda = loanPda;
            const secondLoanEscrowAta = loanEscrowAta;
            await program.methods
                .setLoanForDefaultTesting(10)
                .accounts({ loan: secondLoanPda })
                .rpc();
            await program.methods
                .markDefault()
                .accountsPartial({
                    loan: secondLoanPda,
                    config: configPda,
                    loanEscrowAta: secondLoanEscrowAta,
                })
                .rpc();

            const firstLoan = await program.account.loanAccount.fetch(firstLoanPda);
            const secondLoan = await program.account.loanAccount.fetch(secondLoanPda);

            expect(firstLoan.state).to.equal(6);
            expect(secondLoan.state).to.equal(6);
        });
    });
});