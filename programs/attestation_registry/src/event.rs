use anchor_lang::prelude::*;

use crate::state::SchemaType;

#[event]
pub struct ConfigInitialized {
    pub admin: Pubkey,
    pub max_expiry_secs: i64,
}

#[event]
pub struct IssuerAdded {
    pub issuer: Pubkey,
}

#[event]
pub struct IssuerRemoved {
    pub issuer: Pubkey,
}

#[event]
pub struct IssuerStatusChanged {
    pub issuer: Pubkey,
    pub enabled: bool,
}

#[event]
pub struct SchemaAdded {
    pub schema: SchemaType,
}

#[event]
pub struct AttestationPosted {
    pub subject: Pubkey,
    pub schema_id: SchemaType,
    pub issuer: Pubkey,
    pub claim_hash: [u8; 32],
    pub expiry_ts: i64,
}

#[event]
pub struct AttestationRevoked {
    pub subject: Pubkey,
    pub schema_id: SchemaType,
    pub issuer: Pubkey,
}

#[event]
pub struct AttestationExpiryUpdated {
    pub subject: Pubkey,
    pub schema_id: SchemaType,
    pub new_expiry_ts: i64,
}

#[event]
pub struct AdminChanged {
    pub old_admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct PauseChanged {
    pub paused: bool,
}

#[event]
pub struct MaxExpiryChanged {
    pub max_expiry_secs: i64,
}