#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod event;
pub mod instructions;
pub mod state;
pub mod types;

use anchor_lang::prelude::*;
pub use constants::*;
pub use event::*;
pub use instructions::*;
pub use state::*;
pub use types::*;

declare_id!("4PqY9kbQzanngrw48sHdCiK44AdCmw2VrEx485JVf7Jo");

#[program]
pub mod score_attestor {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        oracle_threshold: u8,
        max_staleness_secs: i64,
    ) -> Result<()> {
        let bump = ctx.bumps.config;
        ctx.accounts
            .init_config(oracle_threshold, max_staleness_secs, bump)
    }

    pub fn set_admin(ctx: Context<AdminOnly>, new_admin: Pubkey) -> Result<()> {
        ctx.accounts.set_admin(new_admin)
    }

    pub fn set_paused(ctx: Context<AdminOnly>, paused: bool) -> Result<()> {
        ctx.accounts.set_paused(paused)
    }

    pub fn add_oracle(ctx: Context<AdminOnly>, oracle: Pubkey) -> Result<()> {
        ctx.accounts.add_oracle(oracle)
    }

    pub fn remove_oracle(ctx: Context<AdminOnly>, oracle: Pubkey) -> Result<()> {
        ctx.accounts.remove_oracle(oracle)
    }

    pub fn set_oracle_threshold(ctx: Context<AdminOnly>, new_threshold: u8) -> Result<()> {
        ctx.accounts.set_oracle_threshold(new_threshold)
    }

    pub fn set_max_staleness(ctx: Context<AdminOnly>, max_staleness_secs: i64) -> Result<()> {
        ctx.accounts.set_max_staleness(max_staleness_secs)
    }

    pub fn add_model(ctx: Context<AdminOnly>, model_id: ModelId, version: u16) -> Result<()> {
        ctx.accounts.add_model(model_id, version)
    }

    pub fn set_model_status(
        ctx: Context<AdminOnly>,
        model_id: ModelId,
        version: u16,
        enabled: bool,
    ) -> Result<()> {
        ctx.accounts.set_model_status(model_id, version, enabled)
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
        model_id: ModelId,
        model_version: u16,
        feature_commitment: FeatureCommitment,
        score: u16,
        grade: u8,
        pd_bps: u32,
        recommended_min_collateral_bps: u16,
        expiry_ts: i64,
        issuer: Pubkey,
    ) -> Result<()> {
        let score_bump = ctx.bumps.score;
        ctx.accounts.post_score_attestation(
            score_bump,
            &ctx.remaining_accounts,
            model_id,
            model_version,
            feature_commitment,
            score,
            grade,
            pd_bps,
            recommended_min_collateral_bps,
            expiry_ts,
            issuer,
        )
    }
}
