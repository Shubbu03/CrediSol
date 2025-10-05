use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::error::LoanMarketplaceErrorCode;
use crate::event::LoanDefaulted;
use crate::state::config::Config;
use crate::state::loan::LoanState;
use crate::state::LoanAccount;

#[derive(Accounts)]
pub struct DefaultLoan<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(mut)]
    pub loan: Account<'info, LoanAccount>,

    pub config: Account<'info, Config>,

    /// CHECK: PDA
    #[account(
        seeds = [b"loan", loan.borrower.as_ref(), &loan.loan_id.to_le_bytes()],
        bump = loan.bump
    )]
    pub loan_signer: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = loan_escrow_ata.mint == config.usdc_mint,
        constraint = loan_escrow_ata.owner == loan_signer.key(),
    )]
    pub loan_escrow_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> DefaultLoan<'info> {
    pub fn mark_default(&mut self) -> Result<()> {
        let loan = &mut self.loan;

        // Can default from BOTH InRepayment and Delinquent states
        require!(
            loan.state == LoanState::InRepayment as u8 || loan.state == LoanState::Delinquent as u8,
            LoanMarketplaceErrorCode::InvalidState
        );

        let now = Clock::get()?.unix_timestamp;
        require!(
            now > loan.due_ts + 7 * 86_400, // 7 days grace period
            LoanMarketplaceErrorCode::TooEarly
        );

        loan.state = LoanState::Defaulted as u8;

        emit!(LoanDefaulted {
            loan: loan.key(),
            borrower: loan.borrower,
            collateral_seized: loan.collateral_amount.min(self.loan_escrow_ata.amount),
            outstanding_principal: loan.outstanding_principal,
            outstanding_interest: loan.accrued_interest,
        });

        Ok(())
    }
}
