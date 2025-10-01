use anchor_lang::prelude::*;

/// Enum for loan lifecycle states
#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum LoanState {
    Created = 0,
    Funding = 1,
    Funded = 2,
    Drawn = 3,
    InRepayment = 4,
    Delinquent = 5,
    Defaulted = 6,
    Settled = 7,
}

/// Main Loan account
#[account]
#[derive(InitSpace)]
pub struct LoanAccount {
    pub bump: u8,         // 1
    pub borrower: Pubkey, // 32
    pub loan_id: u64,     // 8

    pub amount: u64,             // 8
    pub term_secs: i64,          // 8
    pub max_apr_bps: u32,        // 4
    pub min_collateral_bps: u32, // 4
    pub funding_deadline: i64,   // 8
    pub state: u8,               // 1 (use LoanState as u8)

    pub funded_amount: u64,     // 8
    pub collateral_amount: u64, // 8

    pub actual_apr_bps: u32, // 4
    pub start_ts: i64,       // 8
    pub due_ts: i64,         // 8

    pub last_accrual_ts: i64,       // 8
    pub accrued_interest: u64,      // 8
    pub outstanding_principal: u64, // 8

    pub total_repaid_principal: u64, // 8
    pub total_repaid_interest: u64,  // 8
}
