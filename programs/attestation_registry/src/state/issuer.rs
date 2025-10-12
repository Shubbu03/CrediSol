use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Issuer {
    pub pubkey: Pubkey,
    pub issuer_type: IssuerType,
    pub enabled: bool,
}

impl Issuer {
    pub fn get_eth_address(&self) -> [u8; 20] {
        let mut addr = [0u8; 20];
        addr.copy_from_slice(&self.pubkey.to_bytes()[0..20]);
        addr
    }

    pub fn get_solana_pubkey(&self) -> &Pubkey {
        &self.pubkey
    }

    pub fn from_eth_address(eth_addr: [u8; 20]) -> Pubkey {
        let mut bytes = [0u8; 32];
        bytes[0..20].copy_from_slice(&eth_addr);
        Pubkey::new_from_array(bytes)
    }

    pub fn from_solana_pubkey(pubkey: Pubkey) -> Pubkey {
        pubkey
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
#[repr(u8)]
pub enum IssuerType {
    Solana = 0,    // Ed25519 signatures (Civic, Sismo, etc.)
    Ethereum = 1,  // ECDSA signatures (zkPass, etc.)
}