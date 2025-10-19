use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,                 // 32
    pub bump: u8,                      // 1
    pub paused: bool,                  // 1
    pub attestor: Pubkey,              // 32
    pub secp256k1_pubkey: [u8; 65],   // 65
}