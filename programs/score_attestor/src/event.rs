use anchor_lang::prelude::*;

#[event]
pub struct AttestationPosted {
    pub borrower: Pubkey,
    pub score: u16,
    pub grade: u8,
    pub expiry_ts: i64,
}
