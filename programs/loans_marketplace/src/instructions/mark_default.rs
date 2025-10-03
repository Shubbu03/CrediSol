use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::state::config::Config;
use crate::state::loan::LoanState;
use crate::state::LoanAccount;
// use crate::state::PayoutKind;

use crate::error::LoanMarketplaceErrorCode;
use crate::event::LoanDefaulted;

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
        let escrow_balance = self.loan_escrow_ata.amount;
        let collateral_amount = loan.collateral_amount;
        // let outstanding = loan.outstanding_principal.max(1);
        if collateral_amount > 0 && escrow_balance > 0 {
            let amount_to_distribute = collateral_amount.min(escrow_balance);
            msg!(
                "STUB: Would distribute {} USDC collateral to lenders",
                amount_to_distribute
            );
            //     payout_to_lenders(
            //         amount_to_distribute,
            //         PayoutKind::Collateral,
            //         outstanding,
            //         loan,
            //     )?;
        }
        loan.state = LoanState::Defaulted as u8;
        emit!(LoanDefaulted {
            loan: loan.key(),
            borrower: loan.borrower,
            collateral_seized: collateral_amount.min(escrow_balance),
            outstanding_principal: loan.outstanding_principal,
            outstanding_interest: loan.accrued_interest,
        });
        Ok(())
    }
}
