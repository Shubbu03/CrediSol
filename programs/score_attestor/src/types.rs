use anchor_lang::prelude::*;
use anchor_lang::{AnchorDeserialize, AnchorSerialize};

// Model identifier is fixed 32 bytes (e.g., keccak256/model name hash)
#[derive(
    AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug, PartialEq, Eq, InitSpace,
)]
pub struct ModelId(pub [u8; 32]);

// Commitment to feature vector or input bundle (hash)
// pub type FeatureCommitment = [u8; 32];
#[derive(
    AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug, PartialEq, Eq, InitSpace,
)]
pub struct FeatureCommitment(pub [u8; 32]);
