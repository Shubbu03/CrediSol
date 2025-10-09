use anchor_lang::prelude::*;

use crate::{
    error::AttestationRegistryError,
    event::AttestationRevoked,
    state::{Attestation, Config},
};

#[derive(Accounts)]
pub struct RevokeAttestation<'info> {
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

impl<'info> RevokeAttestation<'info> {
    pub fn revoke_attestation(&mut self) -> Result<()> {
        let config = &self.config;
        let attestation = &mut self.attestation;

        require!(!config.paused, AttestationRegistryError::Paused);
        require!(
            !attestation.revoked,
            AttestationRegistryError::AlreadyRevoked
        );

        // Only issuer or admin can revoke
        let signer = self.signer.key();
        require!(
            signer == attestation.issuer || signer == config.admin,
            AttestationRegistryError::Unauthorized
        );

        attestation.revoked = true;

        emit!(AttestationRevoked {
            subject: attestation.subject,
            schema_id: attestation.schema_id,
            issuer: attestation.issuer,
        });

        Ok(())
    }
}
