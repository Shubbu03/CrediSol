use crate::{
    error::ScoreAttestorError,
    event::{AdminChanged, PausedSet},
    state::Config,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AdminOnly<'info> {
    #[account(
        mut,
        seeds = [b"score_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,
}

impl<'info> AdminOnly<'info> {
    pub fn set_admin(&mut self, new_admin: Pubkey) -> Result<()> {
        self.config.admin = new_admin;
        emit!(AdminChanged { new_admin });
        Ok(())
    }

    pub fn set_paused(&mut self, paused: bool) -> Result<()> {
        self.config.paused = paused;
        emit!(PausedSet { paused });
        Ok(())
    }

    pub fn set_issuer(&mut self, issuer: Pubkey) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);
        self.config.attestor = issuer;
        Ok(())
    }
}
