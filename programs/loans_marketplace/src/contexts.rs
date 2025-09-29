use crate::state::{Config, LoanAccount};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = admin,
        seeds = [b"config"],
        bump,
        space = 8 + Config::SIZE
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub usdc_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(loan_id: u64)]
pub struct CreateLoanRequest<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,

    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = borrower,
        seeds = [b"loan", borrower.key().as_ref(), &loan_id.to_le_bytes()],
        bump,
        space = 8 + LoanAccount::SIZE
    )]
    pub loan: Account<'info, LoanAccount>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = usdc_mint,
        associated_token::authority = loan
    )]
    pub loan_escrow_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = usdc_mint,
        associated_token::authority = loan
    )]
    pub collateral_escrow_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}
