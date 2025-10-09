use anchor_lang::prelude::error_code;

#[error_code]
pub enum AttestationRegistryError {
    #[msg("The registry is paused")]
    Paused,

    #[msg("Issuer not found in registry")]
    IssuerNotFound,

    #[msg("Issuer already exists")]
    IssuerAlreadyExists,

    #[msg("Issuer is disabled")]
    IssuerDisabled,

    #[msg("Too many issuers")]
    TooManyIssuers,

    #[msg("Schema not allowed")]
    SchemaNotAllowed,

    #[msg("Schema already exists")]
    SchemaAlreadyExists,

    #[msg("Too many schemas")]
    TooManySchemas,

    #[msg("Invalid expiry timestamp")]
    InvalidExpiry,

    #[msg("Expiry timestamp is too far in the future")]
    ExpiryTooFar,

    #[msg("Attestation already revoked")]
    AlreadyRevoked,

    #[msg("Unauthorized: must be issuer or admin")]
    Unauthorized,

    #[msg("Invalid admin address")]
    InvalidAdmin,
}