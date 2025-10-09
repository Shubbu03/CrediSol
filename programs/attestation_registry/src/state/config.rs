use anchor_lang::prelude::*;

use crate::{Issuer, SchemaType};

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    pub max_expiry_secs: i64,
    pub paused: bool,
    pub bump: u8,

    #[max_len(32)]
    pub issuers: Vec<Issuer>,

    #[max_len(16)]
    pub schemas: Vec<SchemaType>,
}

impl Config {
    pub const MAX_ISSUERS: usize = 32;
    pub const MAX_SCHEMAS: usize = 16;
}
