use anchor_lang::prelude::*;

/// One per (lender, loan) pair
#[account]
#[derive(InitSpace)]
pub struct LenderShare {
    pub bump: u8,              // 1
    pub lender: Pubkey,        // 32
    pub loan: Pubkey,          // 32
    pub principal: u64,        // 8
    pub repaid_principal: u64, // 8
    pub repaid_interest: u64,  // 8
    pub pro_rata_bps: u32,     // 4 (calculated when loan finalized)
}
