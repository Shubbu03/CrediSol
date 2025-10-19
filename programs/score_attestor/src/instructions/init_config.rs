use crate::{event::ConfigInitialized, state::Config, ANCHOR_DISCRIMINATOR};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init_if_needed,
        payer = admin,
        seeds = [b"score_config"],
        bump,
        space = ANCHOR_DISCRIMINATOR + Config::INIT_SPACE
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeConfig<'info> {
    pub fn init_config(
        &mut self,
        bump: u8,
        attestor: Pubkey,
        secp256k1_pubkey: [u8; 65],
    ) -> Result<()> {
        let cfg = &mut self.config;

        cfg.admin = self.admin.key();
        cfg.bump = bump;
        cfg.paused = false;
        cfg.attestor = attestor;
        cfg.secp256k1_pubkey = secp256k1_pubkey;

        emit!(ConfigInitialized {
            admin: cfg.admin,
            attestor: cfg.attestor,
        });

        Ok(())
    }
}