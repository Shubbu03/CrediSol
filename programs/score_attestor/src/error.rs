use anchor_lang::prelude::error_code;

#[error_code]

pub enum ScoreAttestorError {
    #[msg("Invalid parameter")]
    InvalidParam,
}
