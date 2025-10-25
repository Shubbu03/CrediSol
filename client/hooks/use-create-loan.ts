import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { LoansMarketplace } from "../lib/program/types/loans_marketplace";
import { PublicKey, Keypair } from "@solana/web3.js";
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
    loanId
}: Omit<CreateLoanParams, "address"> & { address?: string; loanId?: BN }): Promise<CreateLoanResult> => {
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

        const finalLoanId = loanId ?? new BN(Keypair.generate().publicKey.toBytes().slice(0, 8));

        const [loanPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("loan"), borrower.toBuffer(), finalLoanId.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        try {
            const existingLoan = await (program.account as any).loanAccount.fetch(loanPda);
            if (existingLoan) {
                console.log("Loan already exists at:", loanPda.toString());
                return {
                    success: false,
                    error: "A loan with this ID already exists. Please use different loan parameters.",
                };
            }
        } catch (error) {
            console.log("Loan PDA is new, proceeding with creation");
        }

        const tx = await program.methods
            .createLoanRequest(
                finalLoanId,
                loanAmount,
                loanTermSeconds,
                maxAprBps,
                minCollateralBps,
                loanFundingDeadline
            )
            .accounts({
                borrower,
                config: configPda,
                usdcMint,
            })
            .transaction();

        return {
            success: true,
            transaction: tx,
            loanPda: loanPda.toString(),
        };
    } catch (error: any) {
        console.error("Error creating loan transaction:", error);
        return {
            success: false,
            error: error.message || "Failed to create loan transaction",
        };
    }
};

export const useCreateLoan = () => {
    const createLoan = async (params: CreateLoanParams): Promise<CreateLoanResult> => {
        try {
            const { success, transaction, loanPda, error } = await createLoanTransaction(params);
            if (!success || !transaction) throw new Error(error || "Failed to create transaction");

            const provider = params.program.provider as anchor.AnchorProvider;
            const connection = provider.connection;

            if (!provider.wallet?.publicKey) throw new Error("Wallet not connected");

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider.wallet.publicKey;

            const signedTx = await provider.wallet.signTransaction(transaction);

            const rawTx = signedTx.serialize();
            let signature: string;

            try {
                signature = await connection.sendRawTransaction(rawTx, {
                    skipPreflight: false,
                    preflightCommitment: "confirmed",
                });
            } catch (err: any) {
                console.error("Transaction error:", err);

                if (err.getLogs) {
                    const logs = await err.getLogs(connection);
                    console.error("Transaction logs:", logs);
                }

                const errorMessage = err.message || err.toString();
                if (errorMessage.includes("already been processed") ||
                    errorMessage.includes("already processed") ||
                    errorMessage.includes("duplicate") ||
                    errorMessage.includes("Blockhash not found")) {

                    console.log("Transaction was already processed, checking if loan exists...");

                    try {
                        const existingLoan = await (params.program.account as any).loanAccount.fetch(loanPda);
                        if (existingLoan) {
                            notify({
                                type: "info",
                                description: "Your loan request was already submitted successfully.",
                            });
                            return { success: true, loanPda };
                        }
                    } catch (fetchError) {
                        console.log("Could not fetch existing loan:", fetchError);
                    }
                }

                throw err;
            }

            // Transaction sent successfully

            await connection.confirmTransaction(
                { signature, blockhash, lastValidBlockHeight },
                "confirmed"
            );

            const listener = params.program.addEventListener(
                "loanCreated",
                (event: any) => {
                    if (event.loan && loanPda && event.loan.toString() === loanPda) {
                        // LoanCreated event received
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
                description: "Your loan request has been submitted successfully!",
            });

            return { success: true, signature, loanPda };
        } catch (error: any) {
            console.error("Error in createLoan:", error);

            notify({
                type: "error",
                title: "Error",
                description: error.message || "Failed to create loan",
            });

            return { success: false, error: error.message || "Failed to create loan" };
        }
    };

    return { createLoan };
};
