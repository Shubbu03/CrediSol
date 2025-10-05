use anchor_lang::{AnchorDeserialize, AnchorSerialize};
use anchor_lang::prelude::*;


// Model identifier is fixed 32 bytes (e.g., keccak256/model name hash)
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, Debug, PartialEq, Eq)]
#[derive(InitSpace)]
pub struct ModelId(pub [u8; 32]);

// Commitment to feature vector or input bundle (hash)
pub type FeatureCommitment = [u8; 32];