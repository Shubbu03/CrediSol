use anchor_lang::prelude::*;

use crate::SchemaType;

#[account]
#[derive(InitSpace)]
pub struct Attestation {
    pub subject: Pubkey,
    pub schema_id: SchemaType,
    pub claim_hash: [u8; 32], // Commitment (NO PII)
    pub issuer: Pubkey,
    pub issued_at: i64,
    pub expiry_ts: i64,
    pub revoked: bool,
    pub bump: u8,
}
