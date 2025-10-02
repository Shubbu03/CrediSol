use anchor_lang::prelude::*;
use anchor_spl::token::transfer;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;


use crate::error::LoanMarketplaceErrorCode;
use crate::state::{LoanAccount, LoanState};

#[derive(Accounts)]
pub struct Drawdown<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(
        mut, 
        has_one = borrower
    )]
    pub loan: Account<'info, LoanAccount>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = loan
    )]
    pub loan_escrow_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = usdc_mint,
        associated_token::authority = borrower
    )]
    pub borrower_ata: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> Drawdown<'info> {
    pub fn drawdown(&mut self) -> Result<()> {
        require!(
            self.loan.state == LoanState::Funded as u8,
            LoanMarketplaceErrorCode::InvalidState
        );

        let now = Clock::get()?.unix_timestamp;

        // transfer loan amount from escrow to borrower
        let cpi_accounts = Transfer {
            from: self.loan_escrow_ata.to_account_info(),
            to: self.borrower_ata.to_account_info(),
            authority: self.loan.to_account_info(),
        };

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"loan",
            self.loan.borrower.as_ref(),
            &self.loan.loan_id.to_le_bytes(),
            &[self.loan.bump],
        ]];

        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        
        transfer(cpi_ctx, self.loan.amount)?;

        // set loan times
        self.loan.start_ts = now;
        self.loan.due_ts = now + self.loan.term_secs;
        self.loan.state = LoanState::Drawn as u8;

        Ok(())
    }
}
