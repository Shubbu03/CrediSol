#![allow(unexpected_cfgs, deprecated)]
pub mod error;
pub mod event;
pub mod instructions;
pub mod state;
pub mod constant;

use anchor_lang::prelude::*;
pub use event::*;
pub use instructions::*;
pub use state::*;
pub use constant::*;


declare_id!("AQ4NQuyNkn9cmDmNpc3HzepHahPM8fWP255pHqrzWPBr");

#[program]
pub mod attestation_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
