use anchor_lang::prelude::*;

use crate::{
    error::AttestationRegistryError,
    state::{Attestation, Config},
    AttestationExpiryUpdated,
};

#[derive(Accounts)]
pub struct UpdateExpiry<'info> {
    #[account(
        seeds = [b"attest_config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    /// CHECK: Subject identity
    pub subject: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"attest",
            subject.key().as_ref(),
            &[attestation.schema_id as u8],
            attestation.issuer.as_ref()
        ],
        bump = attestation.bump,
        constraint = attestation.subject == subject.key()
    )]
    pub attestation: Account<'info, Attestation>,

    pub signer: Signer<'info>,
}

impl<'info> UpdateExpiry<'info> {
    pub fn update_expiry(&mut self, new_expiry_ts: i64) -> Result<()> {
        let config = &self.config;
        let attestation = &mut self.attestation;
        let clock = Clock::get()?;

        require!(!config.paused, AttestationRegistryError::Paused);

        // Only issuer or admin can update
        let signer = self.signer.key();
        require!(
            signer == attestation.issuer || signer == config.admin,
            AttestationRegistryError::Unauthorized
        );

        // Validate new expiry
        require!(
            new_expiry_ts > clock.unix_timestamp,
            AttestationRegistryError::InvalidExpiry
        );
        require!(
            new_expiry_ts <= clock.unix_timestamp + config.max_expiry_secs,
            AttestationRegistryError::ExpiryTooFar
        );

        attestation.expiry_ts = new_expiry_ts;

        emit!(AttestationExpiryUpdated {
            subject: attestation.subject,
            schema_id: attestation.schema_id,
            new_expiry_ts,
        });

        Ok(())
    }
}
