use anchor_lang::prelude::*;

use crate::{
    error::AttestationRegistryError,
    event::SchemaAdded,
    state::{Config, SchemaType},
};

#[derive(Accounts)]
pub struct ManageSchema<'info> {
    #[account(
        mut,
        seeds = [b"attest_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,
}

impl<'info> ManageSchema<'info> {
    pub fn add_schema(&mut self, schema: SchemaType) -> Result<()> {
        let config = &mut self.config;

        require!(!config.paused, AttestationRegistryError::Paused);
        require!(
            !config.schemas.contains(&schema),
            AttestationRegistryError::SchemaAlreadyExists
        );
        require!(
            config.schemas.len() < Config::MAX_SCHEMAS,
            AttestationRegistryError::TooManySchemas
        );

        config.schemas.push(schema);

        emit!(SchemaAdded { schema });

        Ok(())
    }
}
