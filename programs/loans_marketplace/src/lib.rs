pub mod contexts;
pub mod error;
pub mod state;

use crate::contexts::{
    CreateLoanRequest, InitializeConfig, __client_accounts_create_loan_request,
    __client_accounts_initialize_config,
};
use crate::error::LoanMarketplaceErrorCode;
use crate::state::{LoanCreated, LoanState};
use anchor_lang::prelude::*;

declare_id!("BTH9yYvKRBZHXJAPuv724mCMiDcjcnCqef7rDdSZUJWf");

#[program]
pub mod loans_marketplace {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= 1_000, LoanMarketplaceErrorCode::InvalidParam); // cap at 10%

        let cfg = &mut ctx.accounts.config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.fee_bps = fee_bps;
        cfg.usdc_mint = ctx.accounts.usdc_mint.key();
        cfg.bump = ctx.bumps.config;

        Ok(())
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
        require!(amount > 0, LoanMarketplaceErrorCode::InvalidParam);
        require!(term_secs >= 86_400, LoanMarketplaceErrorCode::InvalidParam);
        require!(max_apr_bps > 0, LoanMarketplaceErrorCode::InvalidParam);
        require!(
            min_collateral_bps <= 10_000,
            LoanMarketplaceErrorCode::InvalidParam
        );

        let now = Clock::get()?.unix_timestamp;
        require!(
            funding_deadline > now,
            LoanMarketplaceErrorCode::InvalidParam
        );

        let loan = &mut ctx.accounts.loan;
        loan.bump = ctx.bumps.loan;
        loan.borrower = ctx.accounts.borrower.key();
        loan.loan_id = loan_id;
        loan.amount = amount;
        loan.term_secs = term_secs;
        loan.max_apr_bps = max_apr_bps;
        loan.min_collateral_bps = min_collateral_bps;
        loan.funding_deadline = funding_deadline;
        loan.state = LoanState::Funding as u8;

        loan.funded_amount = 0;
        loan.collateral_amount = 0;
        loan.actual_apr_bps = max_apr_bps;
        loan.start_ts = 0;
        loan.due_ts = 0;
        loan.last_accrual_ts = 0;
        loan.accrued_interest = 0;
        loan.outstanding_principal = amount;
        loan.total_repaid_principal = 0;
        loan.total_repaid_interest = 0;

        emit!(LoanCreated {
            borrower: loan.borrower,
            loan: loan.key(),
            amount,
            term_secs,
            max_apr_bps,
            min_collateral_bps,
            funding_deadline
        });

        Ok(())
    }
}
