use crate::constants::{MAX_MODELS, MAX_ORACLES};
use crate::{
    error::ScoreAttestorError,
    event::{
        AdminChanged, MaxStalenessSet, ModelAdded, ModelStatusSet, OracleAdded, OracleRemoved,
        OracleThresholdSet, PausedSet,
    },
    state::{Config, ModelKey},
    types::ModelId,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AdminOnly<'info> {
    #[account(
        mut,
        seeds = [b"score_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,
}

impl<'info> AdminOnly<'info> {
    pub fn set_admin(&mut self, new_admin: Pubkey) -> Result<()> {
        self.config.admin = new_admin;
        emit!(AdminChanged { new_admin });
        Ok(())
    }

    pub fn set_paused(&mut self, paused: bool) -> Result<()> {
        self.config.paused = paused;
        emit!(PausedSet { paused });
        Ok(())
    }

    pub fn add_oracle(&mut self, oracle: Pubkey) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);
        require!(
            self.config.oracles.len() < MAX_ORACLES,
            ScoreAttestorError::TooManyOracles
        );
        require!(
            !self.config.oracles.iter().any(|o| *o == oracle),
            ScoreAttestorError::OracleExists
        );
        self.config.oracles.push(oracle);
        emit!(OracleAdded { oracle });
        Ok(())
    }

    pub fn remove_oracle(&mut self, oracle: Pubkey) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);
        let before = self.config.oracles.len();
        self.config.oracles.retain(|o| *o != oracle);
        require!(
            self.config.oracles.len() < before,
            ScoreAttestorError::OracleNotFound
        );
        emit!(OracleRemoved { oracle });
        Ok(())
    }

    pub fn set_oracle_threshold(&mut self, new_threshold: u8) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);
        require!(new_threshold > 0, ScoreAttestorError::InvalidParam);
        require!(
            (new_threshold as usize) <= self.config.oracles.len(),
            ScoreAttestorError::InvalidParam
        );
        self.config.oracle_threshold = new_threshold;
        emit!(OracleThresholdSet {
            oracle_threshold: new_threshold
        });
        Ok(())
    }

    pub fn set_max_staleness(&mut self, max_staleness_secs: i64) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);
        require!(max_staleness_secs > 0, ScoreAttestorError::InvalidParam);
        self.config.max_staleness_secs = max_staleness_secs;
        emit!(MaxStalenessSet { max_staleness_secs });
        Ok(())
    }

    pub fn add_model(&mut self, model_id: ModelId, version: u16) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);
        require!(
            self.config.models.len() < MAX_MODELS,
            ScoreAttestorError::TooManyModels
        );
        require!(
            !self
                .config
                .models
                .iter()
                .any(|m| m.model_id == model_id && m.version == version),
            ScoreAttestorError::ModelExists
        );

        self.config.models.push(ModelKey {
            model_id,
            version,
            enabled: true,
        });
        emit!(ModelAdded { model_id, version });
        Ok(())
    }

    pub fn set_model_status(
        &mut self,
        model_id: ModelId,
        version: u16,
        enabled: bool,
    ) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);
        let mut found = false;
        for m in self.config.models.iter_mut() {
            if m.model_id == model_id && m.version == version {
                m.enabled = enabled;
                found = true;
                break;
            }
        }
        require!(found, ScoreAttestorError::ModelNotFound);
        emit!(ModelStatusSet {
            model_id,
            version,
            enabled
        });
        Ok(())
    }
}
