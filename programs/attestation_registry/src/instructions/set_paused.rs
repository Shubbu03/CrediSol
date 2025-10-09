use anchor_lang::prelude::*;

use crate::{state::Config, event::PauseChanged};

#[derive(Accounts)]
pub struct SetPaused<'info> {
    #[account(
        mut,
        seeds = [b"attest_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,
}

impl<'info> SetPaused<'info> {
    pub fn set_paused(&mut self, paused: bool) -> Result<()> {
        let config = &mut self.config;
        config.paused = paused;

        emit!(PauseChanged { paused });

        Ok(())
    }
}