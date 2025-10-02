use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::config::Config;
use crate::state::loan::LoanState;
use crate::state::LoanAccount;
use crate::error::LoanMarketplaceErrorCode;
use crate::{LenderFunded, LenderShare, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct LenderFund<'info> {
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub lender: Signer<'info>,
    #[account(mut)]
    pub loan: Account<'info, LoanAccount>,
    /// CHECK: PDA authority
    #[account(
        seeds = [b"loan", loan.borrower.as_ref(), &loan.loan_id.to_le_bytes()],
        bump = loan.bump
    )]
    pub loan_signer: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = lender_ata.mint == config.usdc_mint,
        constraint = lender_ata.owner == lender.key(),
    )]
    pub lender_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = loan_escrow_ata.mint == config.usdc_mint,
        constraint = loan_escrow_ata.owner == loan_signer.key(),
    )]
    pub loan_escrow_ata: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = lender,
        seeds = [b"lender_share", loan.key().as_ref(), lender.key().as_ref()],
        bump,
        space = ANCHOR_DISCRIMINATOR + LenderShare::INIT_SPACE
    )]
    pub lender_share: Account<'info, LenderShare>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}


impl<'info> LenderFund<'info> {
    pub fn lender_fund(&mut self, amount: u64, lender_share_bump: u8) -> Result<()> {
        require!(amount > 0, LoanMarketplaceErrorCode::InvalidParam);

        let loan = &mut self.loan;

        require!(
            loan.state == LoanState::Funding as u8,
            LoanMarketplaceErrorCode::InvalidState
        );

        require!(
            Clock::get()?.unix_timestamp <= loan.funding_deadline,
            LoanMarketplaceErrorCode::FundingExpired
        );

        let new_funded = loan.funded_amount.checked_add(amount)
            .ok_or(LoanMarketplaceErrorCode::MathOverflow)?;

        require!(
            new_funded <= loan.amount,
            LoanMarketplaceErrorCode::ExceedsLoanAmount
        );

        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.lender_ata.to_account_info(),
                    to: self.loan_escrow_ata.to_account_info(),
                    authority: self.lender.to_account_info(),
                },
            ),
            amount,
        )?;

        let share: &mut Account<'info, LenderShare> = &mut self.lender_share;
        if share.bump == 0 {
            share.bump = lender_share_bump;
            share.lender = self.lender.key();
            share.loan = loan.key();
            share.principal = 0;
            share.repaid_principal = 0;
            share.repaid_interest = 0;
        }

        require!(
            share.loan == loan.key(),
            LoanMarketplaceErrorCode::InvalidAccount
        );

        share.principal = share.principal.checked_add(amount)
            .ok_or(LoanMarketplaceErrorCode::MathOverflow)?;

        loan.funded_amount = new_funded;

        if loan.funded_amount == loan.amount {
            loan.state = LoanState::Funded as u8;
        }

        emit!(LenderFunded {
            loan: loan.key(),
            lender: share.lender,
            amount,
            total_funded: loan.funded_amount
        });

        Ok(())
    }
}