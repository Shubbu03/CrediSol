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
        oracle_authority: Pubkey,
    ) -> Result<()> {
        let bump = ctx.bumps.config;
        ctx.accounts.init_config(oracle_authority, bump)
    }

    pub fn post_attestation(
        ctx: Context<PostAttestation>,
        score: u16,
        grade: u8,
        min_collateral_bps: u32,
        pd_bps: u32,
        expiry_ts: i64,
    ) -> Result<()> {
        let attestation_bump = ctx.bumps.attestation;
        ctx.accounts.post_attestation(
            score,
            grade,
            min_collateral_bps,
            pd_bps,
            expiry_ts,
            attestation_bump,
        )
    }
}
