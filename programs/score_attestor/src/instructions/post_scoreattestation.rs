/*
In Anchor, you cannot declare remaining_accounts in the #[derive(Accounts)] struct. 
Anchor automatically provides all extra accounts passed to the instruction at runtime via:

ctx.remaining_accounts
But inside your impl PostScoreAttestation, you’re trying to access self.remaining_accounts, which doesn’t exist.
*/

use crate::{
    error::ScoreAttestorError,
    event::ScorePosted,
    state::{Config, ScoreAttestation},
    types::{FeatureCommitment, ModelId},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PostScoreAttestation<'info> {
    /// Config to check allowlists and settings
    #[account(
        seeds = [b"score_config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    /// CHECK: subject is just a public key identity; no data needed.
    pub subject: UncheckedAccount<'info>,

    /// CHECK: loan identity key; can be your LoanAccount address
    pub loan: UncheckedAccount<'info>,

    #[account(mut)]
    pub poster: Signer<'info>,

    #[account(
        init_if_needed,
        payer = poster,
        seeds = [b"score", subject.key().as_ref(), loan.key().as_ref()],
        bump,
        space = ScoreAttestation::SPACE
    )]
    pub score: Account<'info, ScoreAttestation>,

    pub system_program: Program<'info, System>,
}

pub fn post_score_attestation(
    ctx: Context<PostScoreAttestation>,
    model_id: ModelId,
    model_version: u16,
    feature_commitment: FeatureCommitment,
    score: u16,
    grade: u8,
    pd_bps: u32,
    recommended_min_collateral_bps: u16,
    expiry_ts: i64,
    issuer: Pubkey,
) -> Result<()> {
    let cfg = &ctx.accounts.config;

    require!(!cfg.paused, ScoreAttestorError::Paused);

    let sigs = count_valid_oracle_signers(cfg, &ctx.remaining_accounts);
    require!(
        sigs >= cfg.oracle_threshold,
        ScoreAttestorError::InsufficientOracleSigners
    );

    require!(
        cfg.models
            .iter()
            .any(|m| m.model_id == model_id && m.version == model_version && m.enabled),
        ScoreAttestorError::ModelNotAllowed
    );

    let now = Clock::get()?.unix_timestamp;
    require!(expiry_ts > now, ScoreAttestorError::InvalidExpiry);

    let att = &mut ctx.accounts.score;
    att.bump = ctx.bumps.score;
    att.subject = ctx.accounts.subject.key();
    att.loan = ctx.accounts.loan.key();
    att.model_id = model_id;
    att.model_version = model_version;
    att.feature_commitment = feature_commitment;
    att.score = score;
    att.grade = grade;
    att.pd_bps = pd_bps;
    att.recommended_min_collateral_bps = recommended_min_collateral_bps;
    att.issuer = issuer;
    att.posted_at = now;
    att.expiry_ts = expiry_ts;
    att.revoked = false;

    emit!(ScorePosted {
        subject: att.subject,
        loan: att.loan,
        model_id,
        model_version,
        score,
        grade,
        pd_bps,
        recommended_min_collateral_bps,
        expiry_ts
    });

    Ok(())
}

fn count_valid_oracle_signers(cfg: &Config, rem: &[AccountInfo]) -> u8 {
    let mut counted: Vec<Pubkey> = Vec::new();
    for acc in rem.iter() {
        if !acc.is_signer { continue; }
        let key = *acc.key;
        if cfg.oracles.iter().any(|o| o == &key) && !counted.contains(&key) {
            counted.push(key);
        }
    }
    counted.len() as u8
}
