use anchor_lang::prelude::*;

use crate::{error::AttestationRegistryError, event::AdminChanged, state::Config};

#[derive(Accounts)]
pub struct SetAdmin<'info> {
    #[account(
        mut,
        seeds = [b"attest_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,
}

impl<'info> SetAdmin<'info> {
    pub fn set_admin(&mut self, new_admin: Pubkey) -> Result<()> {
        let config = &mut self.config;

        require!(!config.paused, AttestationRegistryError::Paused);
        require!(
            new_admin != Pubkey::default(),
            AttestationRegistryError::InvalidAdmin
        );

        let old_admin = config.admin;
        config.admin = new_admin;

        emit!(AdminChanged {
            old_admin,
            new_admin,
        });

        Ok(())
    }
}
