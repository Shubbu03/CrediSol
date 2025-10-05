use crate::{
    error::ScoreAttestorError,
    event::{ScoreExpiryUpdated, ScoreRevoked},
    state::{Config, ScoreAttestation},
    types::ModelId
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
    /// CHECK: subject identity
    pub subject: UncheckedAccount<'info>,
    /// CHECK: loan identity
    pub loan: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"score", subject.key().as_ref(), loan.key().as_ref()],
        bump = score.bump
    )]
    pub score: Account<'info, ScoreAttestation>,
}

impl<'info> AdminAndScore<'info> {
    pub fn revoke_attestation(&mut self) -> Result<()> {
        let att = &mut self.score;
        att.revoked = true;
        emit!(ScoreRevoked {
            subject: att.subject,
            loan: att.loan,
            model_id: ModelId(att.model_id.0),
            model_version: att.model_version,
        });
        Ok(())
    }

    pub fn update_attestation_expiry(&mut self, new_expiry_ts: i64) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(new_expiry_ts > now, ScoreAttestorError::InvalidExpiry);

        let att = &mut self.score;
        att.expiry_ts = new_expiry_ts;
        emit!(ScoreExpiryUpdated {
            subject: att.subject,
            loan: att.loan,
            new_expiry_ts,
        });
        Ok(())
    }
}
