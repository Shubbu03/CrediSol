use anchor_lang::prelude::*;

#[error_code]
pub enum LoanMarketplaceErrorCode {
    #[msg("Invalid parameter")]
    InvalidParam,

    #[msg("Invalid state")]
    InvalidState,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Funding window is over")]
    FundingWindowOver,

    #[msg("Loan is not fully funded")]
    NotFullyFunded,

    #[msg("Insufficient collateral")]
    InsufficientCollateral,

    #[msg("Too early")]
    TooEarly,

    #[msg("Invalid account")]
    InvalidAccount,

    #[msg("Insufficient funding")]
    InsufficientFunding,

    #[msg("Already claimed")]
    AlreadyClaimed,
}
