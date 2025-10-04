use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub oracle_authority: Pubkey,
    pub bump: u8,
}
