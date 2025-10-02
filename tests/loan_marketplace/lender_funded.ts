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

