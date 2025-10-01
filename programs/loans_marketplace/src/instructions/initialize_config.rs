use crate::{constants::ANCHOR_DISCRIMINATOR, error::LoanMarketplaceErrorCode, state::Config};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = ANCHOR_DISCRIMINATOR + Config::INIT_SPACE,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, Config>,

    pub usdc_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeConfig<'info> {
    pub fn init_config(&mut self, fee_bps: u16, config_bump: u8) -> Result<()> {
        require!(fee_bps <= 1000, LoanMarketplaceErrorCode::InvalidParam);

        self.config.set_inner(Config {
            admin: self.admin.key(),
            fee_bps,
            usdc_mint: self.usdc_mint.key(),
            bump: config_bump,
        });

        Ok(())
    }
}
