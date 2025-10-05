use anchor_lang::{prelude::Pubkey, AnchorSerialize};
use anchor_lang::prelude::*;

use crate::constants::{MAX_MODELS, MAX_ORACLES};
use crate::types::ModelId;

#[account]
pub struct Config {
    pub admin: Pubkey,            // 32
    pub bump: u8,                 // 1
    pub paused: bool,             // 1
    pub oracle_threshold: u8,     // 1
    pub max_staleness_secs: i64,  // 8
    pub oracles: Vec<Pubkey>,     // 4 + N*32
    pub models: Vec<ModelKey>,    // 4 + N*35
}
impl Config {
    pub const SPACE: usize =
        8 + // disc
        32 + 1 + 1 + 1 + 8 +
        4 + (MAX_ORACLES * 32) +
        4 + (MAX_MODELS * ModelKey::INIT_SPACE) +
        32; // safety headroom
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug)]
#[derive(InitSpace)]
pub struct ModelKey {
    pub model_id: ModelId, // 32
    pub version: u16,      // 2
    pub enabled: bool,     // 1
}
