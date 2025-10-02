import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createMint } from "@solana/spl-token";
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

    // Once lender_fund is implemented to update funded_amount, enable this success path
    it.skip("finalizes successfully once funded (enable after lender_fund exists)", async () => {
        // Arrange: create loan, call lender_fund to push funded_amount >= amount
        // Then: call finalizeFunding and assert state == Funded and actual_apr_bps set
    });
});


