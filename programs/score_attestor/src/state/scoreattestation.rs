use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ScoreAttestation {
    pub subject: Pubkey,                     // 32: the user wallet or identity
    pub loan: Pubkey,                        // 32: the loan account
    pub score: u16,                          // 2: minimal score
    pub grade: u8,                            // 1: grade of the score
    pub pd_bps: u32,                          // 4: probability of default in basis points
    pub recommended_min_collateral_bps: u16, // 2: recommended collateral in basis points
    pub attestor: Pubkey,                     // 32: attestor / issuer public key
    pub posted_at: i64,                       // 8: timestamp when score was posted
    pub expiry_ts: i64,                       // 8: expiry timestamp for this score
    pub revoked: bool,                        // 1: whether the score is revoked
    pub bump: u8,                             // 1: PDA bump
}
