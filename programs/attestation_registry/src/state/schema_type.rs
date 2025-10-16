use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum SchemaType {
    AnonAadhaar = 0,
    ZkPassIdentity = 1,
    Uniqueness = 2,
    CreditKarmaScore = 3,
    PlaidIncome = 4,
    Custom = 255,
}
