use anchor_lang::prelude::*;

use crate::{state::Config, ConfigInitialized, SchemaType, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = ANCHOR_DISCRIMINATOR + Config::INIT_SPACE,
        seeds = [b"attest_config"],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeConfig<'info> {
    /// Initialize the attestation registry configuration
    pub fn initialize_config(&mut self, max_expiry_secs: i64, bump: u8) -> Result<()> {
        let config: &mut Account<'info, Config> = &mut self.config;
        config.admin = self.admin.key();
        config.max_expiry_secs = max_expiry_secs;
        config.paused = false;
        config.bump = bump;

        config.schemas.push(SchemaType::IdentityVerified);
        config.schemas.push(SchemaType::Uniqueness);
        config.schemas.push(SchemaType::SanctionsClear);
        config.schemas.push(SchemaType::IncomeBand);

        emit!(ConfigInitialized {
            admin: config.admin,
            max_expiry_secs,
        });

        Ok(())
    }
}
