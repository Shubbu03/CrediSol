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

describe("loans_marketplace — lender_fund", () => {
    const provider = AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.LoansMarketplace as Program<LoansMarketplace>;

    let usdcMint: PublicKey;
    let configPda: PublicKey;
    let borrower: anchor.web3.Keypair;
    let lender1: anchor.web3.Keypair;
    let lender2: anchor.web3.Keypair;
    let loanId: BN;
    let loanPda: PublicKey;
    let loanSignerPda: PublicKey;
    let loanEscrowAta: PublicKey;

    const now = () => Math.floor(Date.now() / 1000);
    const DAY_SECONDS = 86_400;
    const LOAN_AMOUNT = new BN(1_000_000_000); // 1000 USDC
    const PARTIAL_AMOUNT = new BN(400_000_000); // 400 USDC

    async function airdrop(pubkey: PublicKey, sol = 2) {
        const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
    }

    async function setupLender(lender: anchor.web3.Keypair, balance = new BN(2_000_000_000)) {
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
            balance.toNumber()
        );
        return lenderAta;
    }

    async function createTestLoan(fundingDeadline?: BN) {
        borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey);

        loanId = new BN(Date.now() + Math.random() * 1000);
        [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );
        [loanSignerPda] = PublicKey.findProgramAddressSync(
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
                fundingDeadline || new BN(now() + 7 * DAY_SECONDS)
            )
            .accountsPartial({
                borrower: borrower.publicKey,
                config: configPda,
                usdcMint
            })
            .signers([borrower])
            .rpc();

        loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanSignerPda, true);

        const escrowInfo = await provider.connection.getAccountInfo(loanEscrowAta);
        if (!escrowInfo) {
            await createAssociatedTokenAccount(
                provider.connection,
                borrower,
                usdcMint,
                loanSignerPda,
                {},
                undefined,
                undefined,
                true
            );
        }
    }

    async function fundLoan(lender: anchor.web3.Keypair, lenderAta: PublicKey, amount: BN) {
        const [lenderSharePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_share"), loanPda.toBuffer(), lender.publicKey.toBuffer()],
            program.programId
        );

        return await program.methods
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
                .initializeConfig(500)
                .accountsPartial({
                    admin: provider.wallet.publicKey,
                    usdcMint
                })
                .rpc();
        }
    });

    beforeEach(async () => {
        lender1 = anchor.web3.Keypair.generate();
        lender2 = anchor.web3.Keypair.generate();
    });

    describe("Success Cases", () => {
        it("allows partial funding and creates lender share", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);

            await fundLoan(lender1, lender1Ata, PARTIAL_AMOUNT);

            const loan = await program.account.loanAccount.fetch(loanPda);
            expect(loan.fundedAmount.toString()).to.equal(PARTIAL_AMOUNT.toString());
            expect(loan.state).to.equal(1); // Still Funding

            const [lenderSharePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("lender_share"), loanPda.toBuffer(), lender1.publicKey.toBuffer()],
                program.programId
            );
            const share = await program.account.lenderShare.fetch(lenderSharePda);
            expect(share.principal.toString()).to.equal(PARTIAL_AMOUNT.toString());
            expect(share.lender.equals(lender1.publicKey)).to.be.true;
        });

        it("allows full funding and transitions to Funded state", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);

            await fundLoan(lender1, lender1Ata, LOAN_AMOUNT);

            const loan = await program.account.loanAccount.fetch(loanPda);
            expect(loan.fundedAmount.toString()).to.equal(LOAN_AMOUNT.toString());
            expect(loan.state).to.equal(2);
        });

        it("allows multiple lenders to fund same loan", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);
            const lender2Ata = await setupLender(lender2);

            await fundLoan(lender1, lender1Ata, PARTIAL_AMOUNT);
            await fundLoan(lender2, lender2Ata, LOAN_AMOUNT.sub(PARTIAL_AMOUNT));

            const loan = await program.account.loanAccount.fetch(loanPda);
            expect(loan.fundedAmount.toString()).to.equal(LOAN_AMOUNT.toString());
            expect(loan.state).to.equal(2);

            const [share1Pda] = PublicKey.findProgramAddressSync(
                [Buffer.from("lender_share"), loanPda.toBuffer(), lender1.publicKey.toBuffer()],
                program.programId
            );
            const [share2Pda] = PublicKey.findProgramAddressSync(
                [Buffer.from("lender_share"), loanPda.toBuffer(), lender2.publicKey.toBuffer()],
                program.programId
            );

            const share1 = await program.account.lenderShare.fetch(share1Pda);
            const share2 = await program.account.lenderShare.fetch(share2Pda);

            expect(share1.principal.toString()).to.equal(PARTIAL_AMOUNT.toString());
            expect(share2.principal.toString()).to.equal(LOAN_AMOUNT.sub(PARTIAL_AMOUNT).toString());
        });

        it("allows lender to add more funds to existing share", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);

            await fundLoan(lender1, lender1Ata, PARTIAL_AMOUNT);
            await fundLoan(lender1, lender1Ata, new BN(200_000_000));

            const [lenderSharePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("lender_share"), loanPda.toBuffer(), lender1.publicKey.toBuffer()],
                program.programId
            );
            const share = await program.account.lenderShare.fetch(lenderSharePda);
            expect(share.principal.toString()).to.equal(new BN(600_000_000).toString());
        });
    });

    describe("Error Cases", () => {
        it("fails with zero amount", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);

            try {
                await fundLoan(lender1, lender1Ata, new BN(0));
                expect.fail("Should have failed");
            } catch (error) {
                expect(error.error.errorCode.code).to.equal("InvalidParam");
            }
        });

        it("fails when loan not in Funding state", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);
            const lender2Ata = await setupLender(lender2);

            await fundLoan(lender1, lender1Ata, LOAN_AMOUNT);

            try {
                await fundLoan(lender2, lender2Ata, new BN(100_000_000));
                expect.fail("Should have failed");
            } catch (error) {
                expect(error.error.errorCode.code).to.equal("InvalidState");
            }
        });

        it("fails when past funding deadline", async () => {
            await createTestLoan(new BN(now() + DAY_SECONDS));
            const lender1Ata = await setupLender(lender1);

            await program.methods
                .setFundingDeadlineForTesting(1)
                .accounts({ loan: loanPda })
                .rpc();

            try {
                await fundLoan(lender1, lender1Ata, PARTIAL_AMOUNT);
                expect.fail("Should have failed");
            } catch (error) {
                expect(error.error.errorCode.code).to.equal("FundingExpired");
            }
        });

        it("fails on overfunding", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);

            try {
                await fundLoan(lender1, lender1Ata, LOAN_AMOUNT.add(new BN(1)));
                expect.fail("Should have failed");
            } catch (error) {
                expect(error.error.errorCode.code).to.equal("ExceedsLoanAmount");
            }
        });

        it("fails with insufficient balance", async () => {
            await createTestLoan();
            const poorLender = anchor.web3.Keypair.generate();
            const poorLenderAta = await setupLender(poorLender, new BN(100_000_000));

            try {
                await fundLoan(poorLender, poorLenderAta, PARTIAL_AMOUNT);
                expect.fail("Should have failed");
            } catch (error) {
                expect(error.message).to.include("insufficient");
            }
        });
    });

    describe("Edge Cases", () => {
        it("handles exact completion amount", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);
            const lender2Ata = await setupLender(lender2);

            await fundLoan(lender1, lender1Ata, PARTIAL_AMOUNT);
            const remaining = LOAN_AMOUNT.sub(PARTIAL_AMOUNT);
            await fundLoan(lender2, lender2Ata, remaining);

            const loan = await program.account.loanAccount.fetch(loanPda);
            expect(loan.fundedAmount.eq(loan.amount)).to.be.true;
            expect(loan.state).to.equal(2);
        });

        it("prevents funding beyond loan amount", async () => {
            await createTestLoan();
            const lender1Ata = await setupLender(lender1);
            const lender2Ata = await setupLender(lender2);

            await fundLoan(lender1, lender1Ata, PARTIAL_AMOUNT);
            const remaining = LOAN_AMOUNT.sub(PARTIAL_AMOUNT);

            try {
                await fundLoan(lender2, lender2Ata, remaining.add(new BN(1)));
                expect.fail("Should have failed");
            } catch (error) {
                expect(error.error.errorCode.code).to.equal("ExceedsLoanAmount");
            }
        });
    });
});