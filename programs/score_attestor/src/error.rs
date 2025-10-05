use anchor_lang::prelude::error_code;

#[error_code]

pub enum ScoreAttestorError {
    #[msg("Unauthorized oracle signer.")]
    UnauthorizedOracle,

    #[msg("Attestation expired or invalid.")]
    InvalidExpiry,

    #[msg("Oracle threshold must be greater than zero")]
    InvalidOracleThreshold,
    
    #[msg("Max staleness seconds must be greater than zero")]
    InvalidMaxStaleness,
    
    #[msg("Generic invalid parameter")]
    InvalidParam,

    #[msg("Paused")]
    Paused,

    #[msg("Too many oracles")]
    TooManyOracles,

    #[msg("Oracle already exists")]
    OracleExists,

    #[msg("Oracle not found")]
    OracleNotFound,

    #[msg("Too many models")]
    TooManyModels,

    #[msg("Model already exists")]
    ModelExists,

    #[msg("Model not found")]
    ModelNotFound,

    #[msg("Model not allowed or disabled")]
    ModelNotAllowed,

    #[msg("Insufficient oracle signers")]
    InsufficientOracleSigners,
}
