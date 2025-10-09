use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum SchemaType {
    IdentityVerified = 0,
    Uniqueness = 1,
    SanctionsClear = 2,
    IncomeBand = 3,
    CreditHistory = 4,
    EmploymentStatus = 5,
    Custom = 255,
}
