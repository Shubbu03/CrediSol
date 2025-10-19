use anchor_lang::prelude::*;

#[event]
pub struct ConfigInitialized {
    pub admin: Pubkey,
    pub attestor: Pubkey,
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
pub struct ScorePosted {
    pub subject: Pubkey,
    pub loan: Pubkey,
    pub score: u16,
    pub grade: u8,
    pub pd_bps: u32,
    pub recommended_min_collateral_bps: u16,
    pub expiry_ts: i64,
}

#[event]
pub struct ScoreRevoked {
    pub subject: Pubkey,
    pub loan: Pubkey
}

#[event]
pub struct ScoreExpiryUpdated {
    pub subject: Pubkey,
    pub loan: Pubkey,
    pub new_expiry_ts: i64,
}
