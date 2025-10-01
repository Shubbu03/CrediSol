use anchor_lang::prelude::*;

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
