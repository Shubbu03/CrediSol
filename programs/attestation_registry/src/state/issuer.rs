use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Issuer {
    pub pubkey: Pubkey,
    pub enabled: bool,
}
