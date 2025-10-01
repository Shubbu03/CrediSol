use anchor_lang::prelude::*;

/// Global config for protocol parameters
#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,     // 32
    pub fee_bps: u16,      // 2
    pub usdc_mint: Pubkey, // 32
    pub bump: u8,          // 1
}
