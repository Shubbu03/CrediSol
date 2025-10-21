#![allow(unexpected_cfgs, deprecated)]
pub mod constant;
pub mod error;
pub mod event;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
pub use constant::*;
pub use error::*;
pub use event::*;
pub use instructions::*;
pub use state::*;

declare_id!("86MykibNZvSLLZWj5jDg7gXViaqMANMeuUauP32xn8sq");

#[program]
pub mod attestation_registry {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, max_expiry: u64) -> Result<()> {
        let bump = ctx.bumps.config;
        ctx.accounts
            .initialize_config(max_expiry.try_into().unwrap(), bump)
    }

    pub fn add_issuer(ctx: Context<ManageIssuer>, issuer: Pubkey, issuer_type: IssuerType) -> Result<()> {
        ctx.accounts.add_issuer(issuer, issuer_type)
    }

    pub fn remove_issuer(ctx: Context<ManageIssuer>, issuer: Pubkey) -> Result<()> {
        ctx.accounts.remove_issuer(issuer)
    }

    pub fn set_issuer_status(
        ctx: Context<ManageIssuer>,
        issuer: Pubkey,
        enabled: bool,
    ) -> Result<()> {
        ctx.accounts.set_issuer_status(issuer, enabled)
    }

    pub fn add_schema(ctx: Context<ManageSchema>, schema: SchemaType) -> Result<()> {
        ctx.accounts.add_schema(schema)
    }

    pub fn set_max_expiry(ctx: Context<SetMaxExpiry>, max_expiry: u64) -> Result<()> {
        ctx.accounts.set_max_expiry(max_expiry.try_into().unwrap())
    }

    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
        ctx.accounts.set_paused(paused)
    }

    pub fn set_admin(ctx: Context<SetAdmin>, new_admin: Pubkey) -> Result<()> {
        ctx.accounts.set_admin(new_admin)
    }

    pub fn post_attestation(
        ctx: Context<PostAttestation>,
        schema_id: SchemaType,
        claim_hash: [u8; 32],
        expiry_ts: i64,
        signature_bytes: [u8; 64],
        recover_id: u8,
        allocator_from_proof: [u8; 65],
        bump: u8,
    ) -> Result<()> {
        ctx.accounts.post_attestation(
            schema_id,
            claim_hash,
            expiry_ts,
            signature_bytes,
            recover_id,
            allocator_from_proof,
            bump,
        )
    }
    
    pub fn revoke_attestation(ctx: Context<RevokeAttestation>) -> Result<()> {
        ctx.accounts.revoke_attestation()
    }

    pub fn update_expiry(ctx: Context<UpdateExpiry>, new_expiry: u64) -> Result<()> {
        ctx.accounts.update_expiry(new_expiry.try_into().unwrap())
    }
}
