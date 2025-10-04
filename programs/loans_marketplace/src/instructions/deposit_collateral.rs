use crate::error::LoanMarketplaceErrorCode;
use crate::state::config::Config;
use crate::state::loan::LoanState;
use crate::state::LoanAccount;
use crate::CollateralDeposited;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct DepositCollateral<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    pub config: Account<'info, Config>,

    #[account(mut, has_one = borrower)]
    pub loan: Account<'info, LoanAccount>,

    // Single escrow ATA (shared for funds + collateral), authority = loan PDA
    #[account(
        mut,
        associated_token::mint = config.usdc_mint,
        associated_token::authority = loan
    )]
    pub loan_escrow_ata: Account<'info, TokenAccount>,

    // Borrower’s USDC ATA
    #[account(
        mut,
        associated_token::mint = config.usdc_mint,
        associated_token::authority = borrower
    )]
    pub borrower_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> DepositCollateral<'info> {
    pub fn deposit_collateral(&mut self, amount: u64) -> Result<()> {
        require!(amount > 0, LoanMarketplaceErrorCode::InvalidParam);

        let loan = &mut self.loan;
        require!(
            loan.state == LoanState::Funding as u8,
            LoanMarketplaceErrorCode::InvalidState
        );

        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.borrower_ata.to_account_info(),
                    to: self.loan_escrow_ata.to_account_info(),
                    authority: self.borrower.to_account_info(),
                },
            ),
            amount,
        )?;

        loan.collateral_amount = loan
            .collateral_amount
            .checked_add(amount)
            .ok_or(LoanMarketplaceErrorCode::MathOverflow)?;

        emit!(CollateralDeposited {
            loan: loan.key(),
            borrower: loan.borrower,
            amount,
            total: loan.collateral_amount
        });

        Ok(())
    }
}
