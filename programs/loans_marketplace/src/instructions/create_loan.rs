use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::constants::ANCHOR_DISCRIMINATOR;
use crate::error::LoanMarketplaceErrorCode;
use crate::event::LoanCreated;
use crate::state::{Config, LoanAccount, LoanState};

#[derive(Accounts)]
#[instruction(loan_id: u64)]
pub struct CreateLoanRequest<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = borrower,
        space = ANCHOR_DISCRIMINATOR + LoanAccount::INIT_SPACE,
        seeds = [b"loan", borrower.key().as_ref(), &loan_id.to_le_bytes()],
        bump,
    )]
    pub loan: Account<'info, LoanAccount>,

    pub usdc_mint: Account<'info, Mint>,

    /// Single escrow ATA for both loan funds AND collateral (both USDC)
    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = usdc_mint,
        associated_token::authority = loan
    )]
    pub loan_escrow_ata: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateLoanRequest<'info> {
    #[allow(clippy::too_many_arguments)]
    pub fn create_loan(
        &mut self,
        loan_id: u64,
        amount: u64,
        term_secs: i64,
        max_apr_bps: u32,
        min_collateral_bps: u32,
        funding_deadline: i64,
        loan_bump: u8,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

        require!(amount > 0, LoanMarketplaceErrorCode::InvalidParam);
        require!(amount >= 1_000_000, LoanMarketplaceErrorCode::InvalidParam); // Min 1 USDC (6 decimals)
        require!(
            amount <= 1_000_000_000_000,
            LoanMarketplaceErrorCode::InvalidParam
        ); // Max 1M USDC

        require!(term_secs >= 86_400, LoanMarketplaceErrorCode::InvalidParam); // Min 1 day
        require!(
            term_secs <= 31_536_000,
            LoanMarketplaceErrorCode::InvalidParam
        ); // Max 1 year

        require!(max_apr_bps > 0, LoanMarketplaceErrorCode::InvalidParam);
        require!(
            max_apr_bps <= 50_000,
            LoanMarketplaceErrorCode::InvalidParam
        );

        require!(
            min_collateral_bps <= 10_000,
            LoanMarketplaceErrorCode::InvalidParam
        ); // Max 100% collateral

        require!(
            funding_deadline > now,
            LoanMarketplaceErrorCode::InvalidParam
        );
        require!(
            funding_deadline <= now + 2_592_000, // Max 30 days from now
            LoanMarketplaceErrorCode::InvalidParam
        );

        self.loan.set_inner(LoanAccount {
            bump: loan_bump,
            borrower: self.borrower.key(),
            loan_id,
            amount,
            term_secs,
            max_apr_bps,
            min_collateral_bps,
            funding_deadline,
            state: LoanState::Funding as u8,
            funded_amount: 0,
            collateral_amount: 0,
            actual_apr_bps: max_apr_bps,
            start_ts: 0,
            due_ts: 0,
            last_accrual_ts: 0,
            accrued_interest: 0,
            outstanding_principal: amount,
            total_repaid_principal: 0,
            total_repaid_interest: 0,
        });

        emit!(LoanCreated {
            borrower: self.borrower.key(),
            loan: self.loan.key(),
            amount,
            term_secs,
            max_apr_bps,
            min_collateral_bps,
            funding_deadline
        });

        Ok(())
    }
}
