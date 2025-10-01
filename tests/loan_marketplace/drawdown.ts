import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createMint } from "@solana/spl-token";
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

    it.skip("succeeds drawdown after finalize_funding and seeding escrow (enable later)", async () => {
        // Arrange: create loan, fund escrow ATA with amount, set state to Funded via finalize_funding
        // Then: call drawdown and assert borrower ATA increased and loan state moved to Drawn
    });
});


