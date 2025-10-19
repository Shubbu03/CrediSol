#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod event;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
pub use constants::*;
pub use event::*;
pub use instructions::*;
pub use state::*;

declare_id!("4PqY9kbQzanngrw48sHdCiK44AdCmw2VrEx485JVf7Jo");

#[program]
pub mod score_attestor {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        attestor: Pubkey,
        secp256k1_pubkey: [u8; 65]
    ) -> Result<()> {
        let bump = ctx.bumps.config;
        ctx.accounts
            .init_config(bump, attestor, secp256k1_pubkey)
    }

    pub fn set_admin(ctx: Context<AdminOnly>, new_admin: Pubkey) -> Result<()> {
        ctx.accounts.set_admin(new_admin)
    }

    pub fn set_paused(ctx: Context<AdminOnly>, paused: bool) -> Result<()> {
        ctx.accounts.set_paused(paused)
    }
    pub fn revoke_attestation(ctx: Context<AdminAndScore>) -> Result<()> {
        ctx.accounts.revoke_attestation()
    }

    pub fn update_attestation_expiry(
        ctx: Context<AdminAndScore>,
        new_expiry_ts: i64,
    ) -> Result<()> {
        ctx.accounts.update_attestation_expiry(new_expiry_ts)
    }

    pub fn post_score_attestation(
        ctx: Context<PostScoreAttestation>,
        score: u16,
        grade: u8,
        pd_bps: u32,
        recommended_min_collateral_bps: u16,
        expiry_ts: i64,
        message: [u8; 32],
        signature: [u8; 64],
        recover_id: u8
    ) -> Result<()> {
        let bump = ctx.bumps.score;
    
        ctx.accounts.post_score_attestation(
            bump,
            score,
            grade,
            pd_bps,
            recommended_min_collateral_bps,
            expiry_ts,
            message,
            signature,
            recover_id
        )
    }
}
