use anchor_lang::prelude::*;

use crate::{error::AttestationRegistryError, event::MaxExpiryChanged, state::Config};

#[derive(Accounts)]
pub struct SetMaxExpiry<'info> {
    #[account(
        mut,
        seeds = [b"attest_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,
}

impl<'info> SetMaxExpiry<'info> {
    pub fn set_max_expiry(&mut self, max_expiry_secs: i64) -> Result<()> {
        let config = &mut self.config;

        require!(!config.paused, AttestationRegistryError::Paused);
        require!(max_expiry_secs > 0, AttestationRegistryError::InvalidExpiry);

        config.max_expiry_secs = max_expiry_secs;

        emit!(MaxExpiryChanged { max_expiry_secs });

        Ok(())
    }
}
