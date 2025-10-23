import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { LoansMarketplace } from "../lib/program/types/loans_marketplace";
import { PublicKey } from "@solana/web3.js";
import { notify } from "../lib/notify";

interface CreateLoanParams {
    address: string;
    program: anchor.Program<LoansMarketplace>;
    amount: number;
    termMonths: number;
    maxAprBps: number;
    minCollateralBps: number;
    fundingDeadlineDays: number;
}

interface CreateLoanResult {
    success: boolean;
    transaction?: anchor.web3.Transaction;
    loanPda?: string;
    error?: string;
    signature?: string;
}

export const createLoanTransaction = async ({
    program,
    address,
    amount,
    termMonths,
    maxAprBps,
    minCollateralBps,
    fundingDeadlineDays,
    loanId = new BN(Date.now())
}: Omit<CreateLoanParams, 'address'> & { address?: string; loanId?: BN }): Promise<CreateLoanResult> => {
    try {
        if (!program.provider) throw new Error("Provider not initialized");

        const borrower = address ? new PublicKey(address) : program.provider.publicKey;
        if (!borrower) throw new Error("No borrower address provided and no wallet connected");

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        );

        const config = await program.account.config.fetch(configPda);
        if (!config?.usdcMint) throw new Error("Invalid protocol config — missing USDC mint");

        const usdcMint = config.usdcMint;
        const loanAmount = new BN(amount * 1_000_000);
        const loanTermSeconds = new BN(Math.floor(termMonths * 30.44 * 24 * 60 * 60));
        const now = Math.floor(Date.now() / 1000);
        const loanFundingDeadline = new BN(now + fundingDeadlineDays * 24 * 60 * 60);

        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), loanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const tx = await program.methods
            .createLoanRequest(
                loanId,
                loanAmount,
                loanTermSeconds,
                maxAprBps,
                minCollateralBps,
                loanFundingDeadline
            )
            .accounts({
                borrower,
                config: configPda,
                usdcMint
            })
            .transaction();

        tx.feePayer = program.provider.publicKey;

        return {
            success: true,
            transaction: tx,
            loanPda: loanPda.toString()
        };
    } catch (error: any) {
        console.error("Error creating loan transaction:", error);
        return {
            success: false,
            error: error.message || "Failed to create loan transaction"
        };
    }
};

export const useCreateLoan = () => {
    const createLoan = async (params: CreateLoanParams): Promise<CreateLoanResult> => {
        try {
            const {
                success,
                transaction,
                loanPda,
                error
            } = await createLoanTransaction(params);

            if (!success || !transaction) {
                throw new Error(error || "Failed to create transaction");
            }

            if (!params.program.provider.wallet) {
                throw new Error("Wallet not connected");
            }

            const latest = await params.program.provider.connection.getLatestBlockhash("confirmed");
            transaction.recentBlockhash = latest.blockhash;

            const signedTx = await params.program.provider.wallet.signTransaction(transaction);

            const signature = await params.program.provider.connection.sendRawTransaction(
                signedTx.serialize(),
                {
                    skipPreflight: false,
                    preflightCommitment: "confirmed"
                }
            );

            console.log("Sent tx:", signature);

            await params.program.provider.connection.confirmTransaction({
                signature,
                blockhash: latest.blockhash,
                lastValidBlockHeight: latest.lastValidBlockHeight,
            }, "confirmed");

            const listener = params.program.addEventListener(
                "loanCreated",
                (event: any, _slot: number) => {
                    if (event.loan && loanPda && event.loan.toString() === loanPda) {
                        console.log("LoanCreated event:", event);
                    }
                }
            );

            setTimeout(() => {
                try {
                    params.program.removeEventListener(listener);
                } catch (e) {
                    console.warn("Failed to remove event listener:", e);
                }
            }, 30000);

            notify({
                type: "success",
                title: "Loan Created",
                description: `Your loan request has been submitted successfully!`
            });

            return {
                success: true,
                signature,
                loanPda
            };
        } catch (error: any) {
            console.error("Error in createLoan:", error);

            notify({
                type: "error",
                title: "Error",
                description: error.message || "Failed to create loan"
            });

            return {
                success: false,
                error: error.message || "Failed to create loan"
            };
        }
    };

    return { createLoan };
};
