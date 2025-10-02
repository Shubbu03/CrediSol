use anchor_lang::prelude::*;

/// Global config for protocol parameters
#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey, // 32
    // this is our protocol fee, added during init by admin, also it's caped at 10%, see the initialize_config.rs,
    // 1 bps = 0.01%
    pub fee_bps: u16,      // 2,
    pub usdc_mint: Pubkey, // 32
    pub bump: u8,          // 1
}
