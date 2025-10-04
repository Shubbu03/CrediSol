#![allow(unexpected_cfgs, deprecated)]
pub mod constants;
pub mod error;
pub mod event;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
pub use constants::*;
pub use event::*;
pub use instructions::*;
pub use state::*;

declare_id!("4PqY9kbQzanngrw48sHdCiK44AdCmw2VrEx485JVf7Jo");

#[program]
pub mod score_attestor {
    use super::*;

}

