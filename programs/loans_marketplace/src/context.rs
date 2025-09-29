use crate::{state::Config};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

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

    // The PDA authority for loan & escrows (derived from same seeds as loan)
    /// CHECK: derived PDA used as token authority
    #[account(
        seeds = [b"loan", borrower.key().as_ref(), &loan_id.to_le_bytes()],
        bump = loan.bump
    )]
    pub loan_signer: UncheckedAccount<'info>,

    pub usdc_mint: Account<'info, Mint>,

    // Create both escrow ATAs for USDC owned by loan_signer
    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = usdc_mint,
        associated_token::authority = loan_signer
    )]
    pub loan_escrow_ata: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = borrower,
        associated_token::mint = usdc_mint,
        associated_token::authority = loan_signer
    )]
    pub collateral_escrow_ata: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}
