import { useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import type { LoansMarketplace } from "../lib/program/types/loans_marketplace";

interface LoanAccount {
    pubkey: string;
    account: any;
}

export function useUserLoans(
    program: anchor.Program<LoansMarketplace> | null,
    borrowerAddress?: string
) {
    const [loans, setLoans] = useState<LoanAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!program || !borrowerAddress) return;

        const fetchLoans = async () => {
            try {
                setLoading(true);
                setError(null);

                const borrower = new PublicKey(borrowerAddress);

                const allLoans = await program.account.loanAccount.all([{
                    memcmp: {
                        offset: 8 + 1,
                        bytes: borrower.toBase58(),
                    },
                },
                ]);

                // const sorted = allLoans.sort(
                //     (a, b) =>
                //         Number(b.account.loanId?.toString() || 0) -
                //         Number(a.account.loanId?.toString() || 0)
                // );

                const sorted = allLoans.sort().reverse();

                setLoans(
                    sorted.map((loan) => ({
                        pubkey: loan.publicKey.toString(),
                        account: loan.account,
                    }))
                );
            } catch (err: any) {
                console.error("Error fetching loans:", err);
                setError(err.message || "Failed to fetch loans");
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, [program, borrowerAddress]);

    return { loans, loading, error };
}
