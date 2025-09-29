use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub fee_bps: u16,
    pub usdc_mint: Pubkey,
    pub bump: u8,
}

impl Config {
    pub const SIZE: usize = 32 + 2 + 32 + 1;
}

#[repr(u8)]
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

#[account]
pub struct LoanAccount {
    pub bump: u8,
    pub borrower: Pubkey,
    pub loan_id: u64,

    pub amount: u64,
    pub term_secs: i64,
    pub max_apr_bps: u32,
    pub min_collateral_bps: u32,
    pub funding_deadline: i64,
    pub state: u8,

    pub funded_amount: u64,
    pub collateral_amount: u64,

    pub actual_apr_bps: u32,
    pub start_ts: i64,
    pub due_ts: i64,

    pub last_accrual_ts: i64,
    pub accrued_interest: u64,
    pub outstanding_principal: u64,

    pub total_repaid_principal: u64,
    pub total_repaid_interest: u64,
}
impl LoanAccount {
    pub const SIZE: usize = 1 + 32 + 8 + 8 + 8 + 4 + 4 + 8 + 1 + 8 + 8 + 4 + 8 + 8 + 8 + 8 + 8 + 8;
}

#[event]
pub struct LoanCreated {
    pub borrower: Pubkey,
    pub loan: Pubkey,
    pub amount: u64,
    pub term_secs: i64,
    pub max_apr_bps: u32,
    pub min_collateral_bps: u32,
    pub funding_deadline: i64,
}