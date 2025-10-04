use crate::{
    error::ScoreAttestorError,
    state::{Attestation, Config},
    AttestationPosted, ANCHOR_DISCRIMINATOR,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PostAttestation<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = oracle_authority @ ScoreAttestorError::UnauthorizedOracle
    )]
    pub config: Account<'info, Config>,

    #[account(
        init_if_needed,
        payer = oracle_authority,
        seeds = [b"attestation", borrower.key().as_ref()],
        bump,
        space = ANCHOR_DISCRIMINATOR + Attestation::INIT_SPACE
    )]
    pub attestation: Account<'info, Attestation>,

    /// CHECK: read-only borrower account
    pub borrower: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> PostAttestation<'info> {
    pub fn post_attestation(
        &mut self,
        score: u16,
        grade: u8,
        min_collateral_bps: u32,
        pd_bps: u32,
        expiry_ts: i64,
        attestation_bump: u8,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(expiry_ts > now, ScoreAttestorError::InvalidExpiry);

        self.attestation.set_inner(Attestation {
            bump: attestation_bump,
            subject: self.borrower.key(),
            issuer: self.oracle_authority.key(),
            model_id: 1,
            version: 1,
            credit_score: score,
            grade,
            min_collateral_bps,
            pd_bps,
            timestamp: now,
            expiry_ts,
        });

        emit!(AttestationPosted {
            borrower: self.borrower.key(),
            score,
            grade,
            expiry_ts,
        });

        Ok(())
    }
}
