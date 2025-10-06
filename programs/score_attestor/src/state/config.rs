use anchor_lang::prelude::*;
use anchor_lang::{prelude::Pubkey, AnchorSerialize};

use crate::types::ModelId;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,           // 32
    pub bump: u8,                // 1
    pub paused: bool,            // 1
    pub oracle_threshold: u8,    // 1
    pub max_staleness_secs: i64, // 8
    #[max_len(16)] // MAX_ORACLES
    pub oracles: Vec<Pubkey>, // 4 + N*32
    #[max_len(32)] // MAX_MODELS
    pub models: Vec<ModelKey>, // 4 + N*35
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug, InitSpace)]
pub struct ModelKey {
    pub model_id: ModelId, // 32
    pub version: u16,      // 2
    pub enabled: bool,     // 1
}
