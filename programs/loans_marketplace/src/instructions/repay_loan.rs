use crate::error::LoanMarketplaceErrorCode;
use crate::state::config::Config;
use crate::state::loan::LoanState;
use crate::state::LoanAccount;
use crate::{LoanSettled, Repayment};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct RepayLoan<'info> {
    #[account(mut, has_one = borrower)]
    pub loan: Account<'info, LoanAccount>,
    pub borrower: Signer<'info>,
    pub config: Account<'info, Config>,
    /// CHECK: PDA authority
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

    #[account(
        mut,
        constraint = borrower_ata.mint == config.usdc_mint,
        constraint = borrower_ata.owner == borrower.key(),
    )]
    pub borrower_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> RepayLoan<'info> {
    pub fn repay(&mut self, repay_amount: u64) -> Result<()> {
        require!(repay_amount > 0, LoanMarketplaceErrorCode::InvalidParam);

        let loan = &mut self.loan;
        require!(
            loan.state == LoanState::InRepayment as u8,
            LoanMarketplaceErrorCode::InvalidState
        );

        // Transfer repayment from borrower to loan escrow
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.borrower_ata.to_account_info(),
                    to: self.loan_escrow_ata.to_account_info(),
                    authority: self.borrower.to_account_info(),
                },
            ),
            repay_amount,
        )?;

        // Accrue simple interest
        let now = Clock::get()?.unix_timestamp;
        if now > loan.last_accrual_ts {
            let time_elapsed = now - loan.last_accrual_ts;
            let interest_to_accrue = (loan.outstanding_principal as u128)
                .checked_mul(loan.max_apr_bps as u128)
                .ok_or(LoanMarketplaceErrorCode::MathOverflow)?
                .checked_mul(time_elapsed as u128)
                .ok_or(LoanMarketplaceErrorCode::MathOverflow)?
                .checked_div(10_000u128 * 365 * 24 * 60 * 60)
                .ok_or(LoanMarketplaceErrorCode::MathOverflow)?
                as u64;

            loan.accrued_interest = loan
                .accrued_interest
                .checked_add(interest_to_accrue)
                .ok_or(LoanMarketplaceErrorCode::MathOverflow)?;

            loan.last_accrual_ts = now;
        }

        let mut remaining = repay_amount;

        // Pay accrued interest first
        if loan.accrued_interest > 0 && remaining > 0 {
            let pay_interest = remaining.min(loan.accrued_interest);
            loan.accrued_interest = loan.accrued_interest.saturating_sub(pay_interest);
            loan.total_repaid_interest = loan
                .total_repaid_interest
                .checked_add(pay_interest)
                .ok_or(LoanMarketplaceErrorCode::MathOverflow)?;
            remaining = remaining.saturating_sub(pay_interest);
        }

        // Then pay principal
        if loan.outstanding_principal > 0 && remaining > 0 {
            let pay_principal = remaining.min(loan.outstanding_principal);
            loan.outstanding_principal = loan.outstanding_principal.saturating_sub(pay_principal);
            loan.total_repaid_principal = loan
                .total_repaid_principal
                .checked_add(pay_principal)
                .ok_or(LoanMarketplaceErrorCode::MathOverflow)?;
            remaining = remaining.saturating_sub(pay_principal);
        }

        // If fully repaid, settle loan and return only remaining collateral
        if loan.outstanding_principal == 0 && loan.accrued_interest == 0 {
            let seeds = &[
                b"loan".as_ref(),
                loan.borrower.as_ref(),
                &loan.loan_id.to_le_bytes(),
                &[loan.bump],
            ];
            let signer = &[&seeds[..]];

            let collateral_to_return = loan.collateral_amount.min(self.loan_escrow_ata.amount);

            if collateral_to_return > 0 {
                token::transfer(
                    CpiContext::new_with_signer(
                        self.token_program.to_account_info(),
                        Transfer {
                            from: self.loan_escrow_ata.to_account_info(),
                            to: self.borrower_ata.to_account_info(),
                            authority: self.loan_signer.to_account_info(),
                        },
                        signer,
                    ),
                    collateral_to_return,
                )?;
                loan.collateral_amount =
                    loan.collateral_amount.saturating_sub(collateral_to_return);
            }

            loan.state = LoanState::Settled as u8;
            emit!(LoanSettled { loan: loan.key() });
        } else {
            emit!(Repayment {
                loan: loan.key(),
                amount: repay_amount.saturating_sub(remaining)
            });
        }

        Ok(())
    }
}
