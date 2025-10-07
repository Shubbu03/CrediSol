use anchor_lang::prelude::*;

use crate::types::ModelId;

#[event]
pub struct ConfigInitialized {
    pub admin: Pubkey,
    pub oracle_threshold: u8,
    pub max_staleness_secs: i64,
}

#[event]
pub struct AdminChanged {
    pub new_admin: Pubkey,
}

#[event]
pub struct PausedSet {
    pub paused: bool,
}

#[event]
pub struct OracleAdded {
    pub oracle: Pubkey,
}

#[event]
pub struct OracleRemoved {
    pub oracle: Pubkey,
}

#[event]
pub struct OracleThresholdSet {
    pub oracle_threshold: u8,
}

#[event]
pub struct MaxStalenessSet {
    pub max_staleness_secs: i64,
}

#[event]
pub struct ModelAdded {
    pub model_id: ModelId,
    pub version: u16,
}

#[event]
pub struct ModelStatusSet {
    pub model_id: ModelId,
    pub version: u16,
    pub enabled: bool,
}

#[event]
pub struct ScorePosted {
    pub subject: Pubkey,
    pub loan: Pubkey,
    pub model_id: ModelId,
    pub model_version: u16,
    pub score: u16,
    pub grade: u8,
    pub pd_bps: u32,
    pub recommended_min_collateral_bps: u16,
    pub expiry_ts: i64,
}

#[event]
pub struct ScoreRevoked {
    pub subject: Pubkey,
    pub loan: Pubkey,
    pub model_id: ModelId,
    pub model_version: u16,
}

#[event]
pub struct ScoreExpiryUpdated {
    pub subject: Pubkey,
    pub loan: Pubkey,
    pub new_expiry_ts: i64,
}
