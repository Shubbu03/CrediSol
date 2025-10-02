#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod event;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
pub use constants::*;
pub use event::*;
pub use instructions::*;
pub use state::*;

declare_id!("BTH9yYvKRBZHXJAPuv724mCMiDcjcnCqef7rDdSZUJWf");

#[program]
pub mod loans_marketplace {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, fee_bps: u16) -> Result<()> {
        let config_bump = ctx.bumps.config;
        ctx.accounts.init_config(fee_bps, config_bump)
    }

    pub fn create_loan_request(
        ctx: Context<CreateLoanRequest>,
        loan_id: u64,
        amount: u64,
        term_secs: i64,
        max_apr_bps: u32,
        min_collateral_bps: u32,
        funding_deadline: i64,
    ) -> Result<()> {
        let loan_bump = ctx.bumps.loan;
        ctx.accounts.create_loan(
            loan_id,
            amount,
            term_secs,
            max_apr_bps,
            min_collateral_bps,
            funding_deadline,
            loan_bump,
        )
    }

    pub fn finalize_funding(ctx: Context<FinalizeFunding>) -> Result<()> {
        ctx.accounts.finalize_funding()
    }

    pub fn drawdown(ctx: Context<Drawdown>) -> Result<()> {
        ctx.accounts.drawdown()
    }

    pub fn payout_to_lenders(ctx: Context<PayoutLenders>) -> Result<()> {
        ctx.accounts.payout()
    pub fn mark_default(ctx: Context<DefaultLoan>) -> Result<()> {
        ctx.accounts.mark_default()
    }    

    pub fn set_loan_for_default_testing(ctx: Context<SetLoanForDefaultTesting>, days_overdue: u8) -> Result<()> {
        ctx.accounts.set_loan_for_default_testing(days_overdue)
    }
}
