use anchor_lang::prelude::*;
use crate::state::loan::LoanState;
use crate::state::LoanAccount;

#[derive(Accounts)]
pub struct SetLoanForDefaultTesting<'info> {
    #[account(mut)]
    pub loan: Account<'info, LoanAccount>,
}

impl<'info> SetLoanForDefaultTesting<'info> {
    pub fn set_loan_for_default_testing(
        &mut self,
        days_overdue: u8,
    ) -> Result<()> {
        let loan = &mut self.loan;
        let now = Clock::get()?.unix_timestamp;

        // Set loan to InRepayment state with past due date
        loan.state = LoanState::InRepayment as u8;
        loan.due_ts = now - (days_overdue as i64 * 86_400);
        loan.start_ts = loan.due_ts - (30 * 86_400); // Started 30 days before due
        loan.funded_amount = loan.amount;
        loan.last_accrual_ts = loan.start_ts;

        Ok(())
    }

    pub fn set_funding_deadline_for_testing(&mut self, days_past: u8) -> Result<()> {
        let loan = &mut self.loan;
        let now = Clock::get()?.unix_timestamp;
        // Set funding deadline to past date, keep loan in Funding state
        loan.funding_deadline = now - (days_past as i64 * 86_400);
        Ok(())
    }
}