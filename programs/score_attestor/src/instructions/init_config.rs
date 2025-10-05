use crate::{error::ScoreAttestorError, state::Config, event::ConfigInitialized};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = admin,
        seeds = [b"score_config"],
        bump,
        space = Config::SPACE
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeConfig<'info> {
    pub fn init_config(
        &mut self,
        oracle_threshold: u8,
        max_staleness_secs: i64,
        bump: u8
    ) -> Result<()> {
        let cfg = &mut self.config;

        cfg.admin = self.admin.key();
        cfg.bump = bump;
        cfg.paused = false;

        require!(oracle_threshold > 0, ScoreAttestorError::InvalidOracleThreshold);
        cfg.oracle_threshold = oracle_threshold;

        require!(max_staleness_secs > 0, ScoreAttestorError::InvalidMaxStaleness);
        cfg.max_staleness_secs = max_staleness_secs;

        cfg.oracles = Vec::new();
        cfg.models = Vec::new();

        emit!(ConfigInitialized {
            admin: cfg.admin,
            oracle_threshold,
            max_staleness_secs,
        });

        Ok(())
    }
}

