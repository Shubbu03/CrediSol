use anchor_lang::{
    prelude::*,
    solana_program::{secp256k1_recover::secp256k1_recover},
};

use crate::{
    error::AttestationRegistryError,
    event::AttestationPosted,
    state::{Attestation, Config, SchemaType},
    IssuerType,
};

#[derive(Accounts)]
#[instruction(schema_id: SchemaType)]
pub struct PostAttestation<'info> {
    #[account(
        seeds = [b"attest_config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Ethereum address mapped to a 32-byte Pubkey; does NOT sign
    pub issuer: UncheckedAccount<'info>,

    /// CHECK: subject may or may not be a Signer depending on your policy
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

    pub system_program: Program<'info, System>,
}

impl<'info> PostAttestation<'info> {
    pub fn post_attestation(
        &mut self,
        schema_id: SchemaType,
        claim_hash: [u8; 32],
        expiry_ts: i64,
        signature_bytes: [u8; 64],
        recover_id: u8,
        allocator_from_proof: [u8; 65],
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

        match issuer_entry.issuer_type {
            IssuerType::Ethereum => {
                Self::verify_eth_sig(
                    &allocator_from_proof,
                    &signature_bytes,
                    recover_id,
                    &claim_hash,
                )?;
            }
            IssuerType::Solana => {
                require!(
                    signature_bytes.len() == 64,
                    AttestationRegistryError::InvalidSignature
                );
            }
        }

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

    fn verify_eth_sig(
        expected_address: &[u8; 65],
        signature_bytes: &[u8; 64],
        recover_id: u8,
        message_hash: &[u8; 32],
    ) -> Result<()> {
        let recovered_pubkey = secp256k1_recover(message_hash, recover_id, signature_bytes)
            .map_err(|_| AttestationRegistryError::InvalidSignature)?;
        let mut full_pubkey = vec![4u8];

        full_pubkey.extend_from_slice(&recovered_pubkey.to_bytes());

        require!(
            full_pubkey == expected_address,
            AttestationRegistryError::InvalidSignature
        );
    
        Ok(())
    } 
}
