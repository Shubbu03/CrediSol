use anchor_lang::prelude::*;

use crate::{
    error::AttestationRegistryError, event::IssuerAdded, event::IssuerRemoved,
    event::IssuerStatusChanged, state::Config, state::Issuer,
};

#[derive(Accounts)]
pub struct ManageIssuer<'info> {
    #[account(
        mut,
        seeds = [b"attest_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,
}

impl<'info> ManageIssuer<'info> {
    pub fn add_issuer(&mut self, issuer: Pubkey) -> Result<()> {
        let config = &mut self.config;

        require!(!config.paused, AttestationRegistryError::Paused);
        require!(
            !config.issuers.iter().any(|i| i.pubkey == issuer),
            AttestationRegistryError::IssuerAlreadyExists
        );
        require!(
            config.issuers.len() < Config::MAX_ISSUERS,
            AttestationRegistryError::TooManyIssuers
        );

        config.issuers.push(Issuer {
            pubkey: issuer,
            enabled: true,
        });

        emit!(IssuerAdded { issuer });

        Ok(())
    }

    pub fn remove_issuer(&mut self, issuer: Pubkey) -> Result<()> {
        let config = &mut self.config;

        require!(!config.paused, AttestationRegistryError::Paused);

        let pos = config
            .issuers
            .iter()
            .position(|i| i.pubkey == issuer)
            .ok_or(AttestationRegistryError::IssuerNotFound)?;

        config.issuers.remove(pos);

        emit!(IssuerRemoved { issuer });

        Ok(())
    }

    pub fn set_issuer_status(&mut self, issuer: Pubkey, enabled: bool) -> Result<()> {
        let config = &mut self.config;

        require!(!config.paused, AttestationRegistryError::Paused);

        let issuer_entry = config
            .issuers
            .iter_mut()
            .find(|i| i.pubkey == issuer)
            .ok_or(AttestationRegistryError::IssuerNotFound)?;

        issuer_entry.enabled = enabled;

        emit!(IssuerStatusChanged { issuer, enabled });

        Ok(())
    }
}
