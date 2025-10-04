#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

declare_id!("6uLcVgj2viBHA5niMsXvKHuxMVvTRFjvgRrD933L8pk3");

#[program]
pub mod reputation {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
