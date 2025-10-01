use crate::error::LoanMarketplaceErrorCode;
use crate::state::{LoanAccount, LoanState};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct FinalizeFunding<'info> {
    #[account(
        mut, 
        has_one = borrower
    )]
    pub loan: Account<'info, LoanAccount>,

    /// CHECK: borrower is informational, no writes
    pub borrower: AccountInfo<'info>,
}

impl<'info> FinalizeFunding<'info> {
    pub fn finalize_funding(&mut self) -> Result<()> {
        require!(
            self.loan.state == LoanState::Funding as u8,
            LoanMarketplaceErrorCode::InvalidState
        );
        require!(
            self.loan.funded_amount >= self.loan.amount,
            LoanMarketplaceErrorCode::InsufficientFunding
        );

        // lock in final APR
        self.loan.actual_apr_bps = self.loan.max_apr_bps;

        // move to Funded
        self.loan.state = LoanState::Funded as u8;

        Ok(())
    }
}
