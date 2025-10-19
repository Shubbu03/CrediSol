use crate::{
    error::ScoreAttestorError,
    event::{ScoreExpiryUpdated, ScoreRevoked},
    state::{Config, ScoreAttestation},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AdminAndScore<'info> {
    #[account(
        mut,
        seeds = [b"score_config"],
        bump = config.bump,
        has_one = admin
    )]
    pub config: Account<'info, Config>,

    pub admin: Signer<'info>,

    // Subject/Loan scope for the attestation being revoked/updated
    /// CHECK: subject identity (pubkey only)
    pub subject: UncheckedAccount<'info>,

    /// CHECK: loan identity (pubkey only)
    pub loan: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"score", subject.key().as_ref(), loan.key().as_ref()],
        bump = score.bump,
        constraint = score.subject == subject.key(),
        constraint = score.loan == loan.key()
    )]
    pub score: Account<'info, ScoreAttestation>,
}

impl<'info> AdminAndScore<'info> {
    pub fn revoke_attestation(&mut self) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);

        self.score.revoked = true;

        emit!(ScoreRevoked {
            subject: self.score.subject,
            loan: self.score.loan
        });

        Ok(())
    }

    pub fn update_attestation_expiry(&mut self, new_expiry_ts: i64) -> Result<()> {
        require!(!self.config.paused, ScoreAttestorError::Paused);

        let now = Clock::get()?.unix_timestamp;
        require!(new_expiry_ts > now, ScoreAttestorError::InvalidExpiry);

        self.score.expiry_ts = new_expiry_ts;

        emit!(ScoreExpiryUpdated {
            subject: self.score.subject,
            loan: self.score.loan,
            new_expiry_ts,
        });

        Ok(())
    }
}