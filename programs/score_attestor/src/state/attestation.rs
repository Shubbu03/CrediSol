use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Attestation {
    pub bump: u8,
    pub subject: Pubkey,
    pub issuer: Pubkey,
    pub model_id: u32,
    pub version: u16,
    pub credit_score: u16,
    pub grade: u8,
    pub min_collateral_bps: u32,
    pub pd_bps: u32,
    pub timestamp: i64,
    pub expiry_ts: i64,
}
