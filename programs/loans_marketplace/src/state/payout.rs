use anchor_lang::prelude::*;

#[derive(PartialEq, Eq, Copy, Clone)]
pub enum PayoutKind {
    Interest,
    Principal,
    Collateral,
}