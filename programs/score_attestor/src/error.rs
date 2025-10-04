use anchor_lang::prelude::error_code;

#[error_code]

pub enum ScoreAttestorError {
    #[msg("Unauthorized oracle signer.")]
    UnauthorizedOracle,

    #[msg("Attestation expired or invalid.")]
    InvalidExpiry,
}
