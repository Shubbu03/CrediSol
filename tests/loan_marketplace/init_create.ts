import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createMint } from "@solana/spl-token";
import { expect } from "chai";
import { LoansMarketplace } from "../../target/types/loans_marketplace";

describe("loans_marketplace — initialize_config + create_loan_request", () => {
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

    it("initializes config", async () => {
        const payer = (provider.wallet as any).payer;
        [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);

        const existing = await program.account.config.fetchNullable(configPda);
        if (existing) {
            usdcMint = existing.usdcMint as PublicKey;
            expect(existing.admin.equals(provider.wallet.publicKey)).to.be.true;
            expect(existing.feeBps).to.equal(500);
            return;
        }

        usdcMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);

        await program.methods
            .initializeConfig(500)
            .accountsPartial({
                admin: provider.wallet.publicKey,
                usdcMint
            })
            .rpc();

        const cfg = await program.account.config.fetch(configPda);
        expect(cfg.admin.equals(provider.wallet.publicKey)).to.be.true;
        expect(cfg.usdcMint.equals(usdcMint)).to.be.true;
        expect(cfg.feeBps).to.equal(500);
    });

    it("creates a loan request successfully", async () => {
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 2);

        const loanId = new BN(Date.now());
        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);
        const collateralEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);

        const amount = new BN(1_000_000);
        const termSecs = new BN(30 * 86_400);
        const maxAprBps = 1200;
        const minCollateralBps = 2000;
        const fundingDeadline = new BN(now() + 3 * 86_400);

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

        const loan = await program.account.loanAccount.fetch(loanPda);
        expect(loan.borrower.equals(borrower.publicKey)).to.be.true;
        expect(loan.amount.toString()).to.equal(amount.toString());
        expect(loan.termSecs.toString()).to.equal(termSecs.toString());
        expect(loan.maxAprBps).to.equal(maxAprBps);
        expect(loan.minCollateralBps).to.equal(minCollateralBps);
        expect(loan.fundingDeadline.toString()).to.equal(fundingDeadline.toString());

        const loanEscrowInfo = await provider.connection.getAccountInfo(loanEscrowAta);
        const collateralEscrowInfo = await provider.connection.getAccountInfo(collateralEscrowAta);
        expect(loanEscrowInfo).to.be.not.null;
        expect(collateralEscrowInfo).to.be.not.null;
    });

    it("rejects if funding_deadline is not in the future", async () => {
        const borrower = anchor.web3.Keypair.generate();
        await airdrop(borrower.publicKey, 1);

        const loanId = new BN(42);
        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.publicKey.toBuffer(), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const loanEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);
        const collateralEscrowAta = await getAssociatedTokenAddress(usdcMint, loanPda, true);

        try {
            await program.methods
                .createLoanRequest(
                    loanId,
                    new BN(1_000),
                    new BN(86_400),
                    500,
                    0,
                    new BN(now() - 10)
                )
                .accountsPartial({
                    borrower: borrower.publicKey,
                    config: configPda,
                    usdcMint,
                })
                .signers([borrower])
                .rpc();

            expect.fail('Expected an error but none was thrown');
        } catch (err) {
            const errorMsg = err.toString();
            expect(errorMsg).to.include('InvalidParam');
        }
    });
});
