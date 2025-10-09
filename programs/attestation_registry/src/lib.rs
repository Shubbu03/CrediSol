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

declare_id!("AQ4NQuyNkn9cmDmNpc3HzepHahPM8fWP255pHqrzWPBr");

#[program]
pub mod attestation_registry {
    use super::*;

    pub fn initialize_config(ctx: Context<InitConfig>, max_expiry: u64) -> Result<()> {
        let bump = ctx.bumps.config;
        ctx.accounts.initialize_config(max_expiry.try_into().unwrap(), bump)
    }

    pub fn add_issuer(ctx: Context<ManageIssuer>, issuer: Pubkey) -> Result<()> {
        ctx.accounts.add_issuer(issuer)
    }

    pub fn remove_issuer(ctx: Context<ManageIssuer>, issuer: Pubkey) -> Result<()> {
        ctx.accounts.remove_issuer(issuer)
    }

    pub fn set_issuer_status(ctx: Context<ManageIssuer>, issuer: Pubkey, enabled: bool) -> Result<()> {
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

    pub fn post_attestation(ctx: Context<PostAttestation>, data: [u8; 32], schema: SchemaType, expiry: i64) -> Result<()> {
        let bump = ctx.bumps.attestation;
        ctx.accounts.post_attestation(schema, data, expiry, bump)
    }

    pub fn revoke_attestation(ctx: Context<RevokeAttestation>) -> Result<()> {
        ctx.accounts.revoke_attestation()
    }

    pub fn update_expiry(ctx: Context<UpdateExpiry>, new_expiry: u64) -> Result<()> {
        ctx.accounts.update_expiry(new_expiry.try_into().unwrap())
    }
}
