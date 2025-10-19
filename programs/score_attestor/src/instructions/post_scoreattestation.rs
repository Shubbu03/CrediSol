use crate::{
    error::ScoreAttestorError, event::ScorePosted, state::ScoreAttestation, ANCHOR_DISCRIMINATOR,
};
use anchor_lang::{prelude::*, solana_program::secp256k1_recover::secp256k1_recover};

#[derive(Accounts)]
pub struct PostScoreAttestation<'info> {
    #[account(
        seeds = [b"score_config"],
        bump = config.bump
    )]
    pub config: Account<'info, crate::state::Config>,

    /// CHECK: subject
    pub subject: UncheckedAccount<'info>,

    /// CHECK: loan
    pub loan: UncheckedAccount<'info>,

    #[account(mut)]
    pub attestor: Signer<'info>,

    #[account(
        init_if_needed,
        payer = attestor,
        seeds = [b"score", subject.key().as_ref(), loan.key().as_ref()],
        bump,
        space = ANCHOR_DISCRIMINATOR + ScoreAttestation::INIT_SPACE
    )]
    pub score: Account<'info, ScoreAttestation>,

    pub system_program: Program<'info, System>,
}

impl<'info> PostScoreAttestation<'info> {
    pub fn post_score_attestation(
        &mut self,
        bump: u8,
        score: u16,
        grade: u8,
        pd_bps: u32,
        recommended_min_collateral_bps: u16,
        expiry_ts: i64,
        message: [u8; 32],
        signature: [u8; 64],
        recover_id: u8,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(expiry_ts > now, ScoreAttestorError::InvalidExpiry);

        require!(
            self.attestor.key() == self.config.attestor,
            ScoreAttestorError::UnauthorizedAttestor
        );

        verify_secp256k1_sig(
            &self.config.secp256k1_pubkey,
            &signature,
            recover_id,
            &message,
        )?;

        let att = &mut self.score;
        att.bump = bump;
        att.subject = self.subject.key();
        att.loan = self.loan.key();
        att.score = score;
        att.grade = grade;
        att.pd_bps = pd_bps;
        att.recommended_min_collateral_bps = recommended_min_collateral_bps;
        att.attestor = self.config.attestor;
        att.posted_at = now;
        att.expiry_ts = expiry_ts;
        att.revoked = false;

        emit!(ScorePosted {
            subject: att.subject,
            loan: att.loan,
            score,
            grade,
            pd_bps,
            recommended_min_collateral_bps,
            expiry_ts,
        });

        Ok(())
    }
}

fn verify_secp256k1_sig(
    expected_pubkey: &[u8; 65],
    signature: &[u8; 64],
    recover_id: u8,
    message_hash: &[u8; 32],
) -> Result<()> {
    let recovered_pubkey = secp256k1_recover(message_hash, recover_id, signature)
        .map_err(|_| ScoreAttestorError::InvalidSignature)?;

    let mut full_pubkey = vec![4u8];
    full_pubkey.extend_from_slice(&recovered_pubkey.to_bytes());

    require!(
        full_pubkey == expected_pubkey,
        ScoreAttestorError::InvalidSignature
    );

    Ok(())
}