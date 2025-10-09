use anchor_lang::prelude::*;

use crate::{
    error::AttestationRegistryError,
    event::AttestationPosted,
    state::{Attestation, Config, SchemaType},
};

#[derive(Accounts)]
#[instruction(schema_id: SchemaType)]
pub struct PostAttestation<'info> {
    #[account(
        seeds = [b"attest_config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    /// CHECK: Subject identity (pubkey only, no PII)
    pub subject: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + Attestation::INIT_SPACE,
        seeds = [
            b"attest",
            subject.key().as_ref(),
            &[schema_id as u8],
            issuer.key().as_ref()
        ],
        bump
    )]
    pub attestation: Account<'info, Attestation>,

    pub issuer: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> PostAttestation<'info> {
    pub fn post_attestation(
        &mut self,
        schema_id: SchemaType,
        claim_hash: [u8; 32],
        expiry_ts: i64,
        bump: u8,
    ) -> Result<()> {
        let config = &self.config;
        let attestation = &mut self.attestation;
        let clock = Clock::get()?;

        require!(!config.paused, AttestationRegistryError::Paused);

        let issuer_entry = config
            .issuers
            .iter()
            .find(|i| i.pubkey == self.issuer.key())
            .ok_or(AttestationRegistryError::IssuerNotFound)?;

        require!(
            issuer_entry.enabled,
            AttestationRegistryError::IssuerDisabled
        );

        require!(
            config.schemas.contains(&schema_id),
            AttestationRegistryError::SchemaNotAllowed
        );

        require!(
            expiry_ts > clock.unix_timestamp,
            AttestationRegistryError::InvalidExpiry
        );
        require!(
            expiry_ts <= clock.unix_timestamp + config.max_expiry_secs,
            AttestationRegistryError::ExpiryTooFar
        );

        attestation.subject = self.subject.key();
        attestation.schema_id = schema_id;
        attestation.claim_hash = claim_hash;
        attestation.issuer = self.issuer.key();
        attestation.issued_at = clock.unix_timestamp;
        attestation.expiry_ts = expiry_ts;
        attestation.revoked = false;
        attestation.bump = bump;

        emit!(AttestationPosted {
            subject: attestation.subject,
            schema_id,
            issuer: attestation.issuer,
            claim_hash,
            expiry_ts,
        });

        Ok(())
    }
}
