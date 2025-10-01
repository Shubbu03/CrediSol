use anchor_lang::prelude::*;
use anchor_spl::token::transfer;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};

use crate::error::LoanMarketplaceErrorCode;
use crate::state::{LenderShare, LoanAccount, LoanState};

#[derive(Accounts)]
pub struct PayoutLenders<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,

    #[account(mut)]
    pub loan: Account<'info, LoanAccount>,

    #[account(
        mut,
        seeds = [b"lender_share", loan.key().as_ref(), lender.key().as_ref()],
        bump,
    )]
    pub lender_share: Account<'info, LenderShare>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = loan
    )]
    pub collateral_escrow_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = lender,
        associated_token::mint = usdc_mint,
        associated_token::authority = lender
    )]
    pub lender_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
}

impl<'info> PayoutLenders<'info> {
    pub fn payout(&mut self) -> Result<()> {
        require!(
            self.loan.state == LoanState::Defaulted as u8,
            LoanMarketplaceErrorCode::InvalidState
        );

        // If already got something, prevent double claim
        require!(
            self.lender_share.repaid_principal == 0 && self.lender_share.repaid_interest == 0,
            LoanMarketplaceErrorCode::AlreadyClaimed
        );

        // entitlement based on pro-rata share
        let entitlement = (self.loan.collateral_amount as u128)
            .checked_mul(self.lender_share.pro_rata_bps as u128)
            .unwrap()
            / 10_000u128;

        let entitlement = entitlement as u64;

        // transfer collateral portion from escrow to lender
        let seeds: &[&[u8]] = &[
            b"loan",
            self.loan.borrower.as_ref(),
            &self.loan.loan_id.to_le_bytes(),
            &[self.loan.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: self.collateral_escrow_ata.to_account_info(),
            to: self.lender_ata.to_account_info(),
            authority: self.loan.to_account_info(),
        };
        let cpi_ctx =
            CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_accounts, signer);
        transfer(cpi_ctx, entitlement)?;

        // mark this lender's share as "claimed" via repaid fields
        self.lender_share.repaid_principal = entitlement;
        self.lender_share.repaid_interest = 0;

        Ok(())
    }
}
