use crate::{constants::ANCHOR_DISCRIMINATOR, state::Config};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = ANCHOR_DISCRIMINATOR + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeConfig<'info> {
    pub fn init_config(&mut self, oracle_authority: Pubkey, bump: u8) -> Result<()> {
        self.config.set_inner(Config {
            oracle_authority,
            bump,
        });

        Ok(())
    }
}
