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

#[event]
pub struct LoanDefaulted {
    pub loan: Pubkey,
    pub borrower: Pubkey,
    pub collateral_seized: u64,
    pub outstanding_principal: u64,
    pub outstanding_interest: u64,
}

#[event]
pub struct LenderFunded {
    pub loan: Pubkey,
    pub lender: Pubkey,
    pub amount: u64,
    pub total_funded: u64,
}

#[event]
pub struct LoanSettled {
    pub loan: Pubkey,
}

#[event]
pub struct Repayment {
    pub loan: Pubkey,
    pub amount: u64,
}
