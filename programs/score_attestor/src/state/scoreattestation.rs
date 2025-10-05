use anchor_lang::prelude::*;

use crate::{types::FeatureCommitment, ModelId};

#[account]
#[derive(InitSpace)]
pub struct ScoreAttestation {
    pub subject: Pubkey,                        // 32
    pub loan: Pubkey,                           // 32
    pub model_id: ModelId,                      // 32
    pub model_version: u16,                     // 2
    pub feature_commitment: FeatureCommitment,  // 32
    pub score: u16,                             // 2
    pub grade: u8,                              // 1
    pub pd_bps: u32,                            // 4
    pub recommended_min_collateral_bps: u16,    // 2
    pub issuer: Pubkey,                         // 32
    pub posted_at: i64,                         // 8
    pub expiry_ts: i64,                         // 8
    pub revoked: bool,                          // 1
    pub bump: u8,                               // 1
}