/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/loans_marketplace.json`.
 */
export type LoansMarketplace = {
  "address": "5CsJHgdh6jtKRVJiJL4bBpTeUcUFV3B9gphEccyvGQmS",
  "metadata": {
    "name": "loansMarketplace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createLoanRequest",
      "discriminator": [
        98,
        217,
        110,
        114,
        5,
        69,
        35,
        204
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "config"
        },
        {
          "name": "loan",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  97,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "borrower"
              },
              {
                "kind": "arg",
                "path": "loanId"
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "loanEscrowAta",
          "docs": [
            "Single escrow ATA for both loan funds AND collateral (both USDC)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "loan"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "loanId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "termSecs",
          "type": "i64"
        },
        {
          "name": "maxAprBps",
          "type": "u32"
        },
        {
          "name": "minCollateralBps",
          "type": "u32"
        },
        {
          "name": "fundingDeadline",
          "type": "i64"
        }
      ]
    },
    {
      "name": "depositCollateral",
      "discriminator": [
        156,
        131,
        142,
        116,
        146,
        247,
        162,
        120
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "signer": true,
          "relations": [
            "loan"
          ]
        },
        {
          "name": "config"
        },
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "loanEscrowAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "loan"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "config.usdc_mint",
                "account": "config"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "borrowerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "borrower"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "config.usdc_mint",
                "account": "config"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "drawdown",
      "discriminator": [
        200,
        40,
        162,
        111,
        156,
        222,
        7,
        243
      ],
      "accounts": [
        {
          "name": "borrower",
          "writable": true,
          "signer": true,
          "relations": [
            "loan"
          ]
        },
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "loanEscrowAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "loan"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "borrowerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "borrower"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "finalizeFunding",
      "discriminator": [
        129,
        81,
        184,
        191,
        58,
        224,
        149,
        90
      ],
      "accounts": [
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "borrower",
          "relations": [
            "loan"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "lenderFund",
      "discriminator": [
        254,
        142,
        79,
        120,
        201,
        255,
        135,
        240
      ],
      "accounts": [
        {
          "name": "config"
        },
        {
          "name": "lender",
          "writable": true,
          "signer": true
        },
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "loanSigner",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  97,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "loan.borrower",
                "account": "loanAccount"
              },
              {
                "kind": "account",
                "path": "loan.loan_id",
                "account": "loanAccount"
              }
            ]
          }
        },
        {
          "name": "lenderAta",
          "writable": true
        },
        {
          "name": "loanEscrowAta",
          "writable": true
        },
        {
          "name": "lenderShare",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  101,
                  110,
                  100,
                  101,
                  114,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "loan"
              },
              {
                "kind": "account",
                "path": "lender"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "markDefault",
      "discriminator": [
        182,
        231,
        123,
        132,
        66,
        208,
        137,
        139
      ],
      "accounts": [
        {
          "name": "caller",
          "writable": true,
          "signer": true
        },
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "config"
        },
        {
          "name": "loanSigner",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  97,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "loan.borrower",
                "account": "loanAccount"
              },
              {
                "kind": "account",
                "path": "loan.loan_id",
                "account": "loanAccount"
              }
            ]
          }
        },
        {
          "name": "loanEscrowAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "payoutToLenders",
      "discriminator": [
        153,
        188,
        14,
        196,
        106,
        37,
        108,
        208
      ],
      "accounts": [
        {
          "name": "lender",
          "writable": true,
          "signer": true
        },
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "lenderShare",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  101,
                  110,
                  100,
                  101,
                  114,
                  95,
                  115,
                  104,
                  97,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "loan"
              },
              {
                "kind": "account",
                "path": "lender"
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "collateralEscrowAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "loan"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lenderAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lender"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "repayLoan",
      "discriminator": [
        224,
        93,
        144,
        77,
        61,
        17,
        137,
        54
      ],
      "accounts": [
        {
          "name": "loan",
          "writable": true
        },
        {
          "name": "borrower",
          "signer": true,
          "relations": [
            "loan"
          ]
        },
        {
          "name": "config"
        },
        {
          "name": "loanSigner",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  97,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "loan.borrower",
                "account": "loanAccount"
              },
              {
                "kind": "account",
                "path": "loan.loan_id",
                "account": "loanAccount"
              }
            ]
          }
        },
        {
          "name": "loanEscrowAta",
          "writable": true
        },
        {
          "name": "borrowerAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setFundingDeadlineForTesting",
      "discriminator": [
        138,
        106,
        0,
        176,
        88,
        253,
        162,
        101
      ],
      "accounts": [
        {
          "name": "loan",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "daysPast",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setLoanForDefaultTesting",
      "discriminator": [
        122,
        205,
        244,
        255,
        202,
        96,
        77,
        128
      ],
      "accounts": [
        {
          "name": "loan",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "daysOverdue",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setLoanForRepaymentTesting",
      "discriminator": [
        239,
        109,
        80,
        134,
        82,
        55,
        253,
        73
      ],
      "accounts": [
        {
          "name": "loan",
          "writable": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "lenderShare",
      "discriminator": [
        241,
        123,
        149,
        50,
        141,
        224,
        21,
        42
      ]
    },
    {
      "name": "loanAccount",
      "discriminator": [
        223,
        49,
        62,
        167,
        247,
        182,
        239,
        60
      ]
    }
  ],
  "events": [
    {
      "name": "collateralDeposited",
      "discriminator": [
        244,
        62,
        77,
        11,
        135,
        112,
        61,
        96
      ]
    },
    {
      "name": "lenderFunded",
      "discriminator": [
        208,
        97,
        170,
        188,
        103,
        246,
        36,
        4
      ]
    },
    {
      "name": "lenderPaidOut",
      "discriminator": [
        247,
        150,
        228,
        96,
        166,
        137,
        120,
        2
      ]
    },
    {
      "name": "loanCreated",
      "discriminator": [
        142,
        148,
        28,
        215,
        65,
        185,
        246,
        200
      ]
    },
    {
      "name": "loanDefaulted",
      "discriminator": [
        194,
        98,
        51,
        88,
        228,
        118,
        173,
        46
      ]
    },
    {
      "name": "loanSettled",
      "discriminator": [
        103,
        190,
        95,
        205,
        122,
        73,
        234,
        87
      ]
    },
    {
      "name": "repayment",
      "discriminator": [
        96,
        27,
        117,
        14,
        106,
        94,
        231,
        43
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidParam",
      "msg": "Invalid parameter"
    },
    {
      "code": 6001,
      "name": "invalidState",
      "msg": "Invalid state"
    },
    {
      "code": 6002,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6003,
      "name": "fundingWindowOver",
      "msg": "Funding window is over"
    },
    {
      "code": 6004,
      "name": "notFullyFunded",
      "msg": "Loan is not fully funded"
    },
    {
      "code": 6005,
      "name": "insufficientCollateral",
      "msg": "Insufficient collateral"
    },
    {
      "code": 6006,
      "name": "tooEarly",
      "msg": "Too early"
    },
    {
      "code": 6007,
      "name": "invalidAccount",
      "msg": "Invalid account"
    },
    {
      "code": 6008,
      "name": "insufficientFunding",
      "msg": "Insufficient funding"
    },
    {
      "code": 6009,
      "name": "alreadyClaimed",
      "msg": "Already claimed"
    },
    {
      "code": 6010,
      "name": "fundingExpired",
      "msg": "Funding expired"
    },
    {
      "code": 6011,
      "name": "exceedsLoanAmount",
      "msg": "Exceeds loan amount"
    }
  ],
  "types": [
    {
      "name": "collateralDeposited",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "total",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "config",
      "docs": [
        "Global config for protocol parameters"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "feeBps",
            "type": "u16"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "lenderFunded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "lender",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalFunded",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lenderPaidOut",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lender",
            "type": "pubkey"
          },
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lenderShare",
      "docs": [
        "One per (lender, loan) pair"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "lender",
            "type": "pubkey"
          },
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "principal",
            "type": "u64"
          },
          {
            "name": "repaidPrincipal",
            "type": "u64"
          },
          {
            "name": "repaidInterest",
            "type": "u64"
          },
          {
            "name": "proRataBps",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "loanAccount",
      "docs": [
        "Main Loan account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "loanId",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "termSecs",
            "type": "i64"
          },
          {
            "name": "maxAprBps",
            "type": "u32"
          },
          {
            "name": "minCollateralBps",
            "type": "u32"
          },
          {
            "name": "fundingDeadline",
            "type": "i64"
          },
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "fundedAmount",
            "type": "u64"
          },
          {
            "name": "collateralAmount",
            "type": "u64"
          },
          {
            "name": "actualAprBps",
            "type": "u32"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "dueTs",
            "type": "i64"
          },
          {
            "name": "lastAccrualTs",
            "type": "i64"
          },
          {
            "name": "accruedInterest",
            "type": "u64"
          },
          {
            "name": "outstandingPrincipal",
            "type": "u64"
          },
          {
            "name": "totalRepaidPrincipal",
            "type": "u64"
          },
          {
            "name": "totalRepaidInterest",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "loanCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "termSecs",
            "type": "i64"
          },
          {
            "name": "maxAprBps",
            "type": "u32"
          },
          {
            "name": "minCollateralBps",
            "type": "u32"
          },
          {
            "name": "fundingDeadline",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "loanDefaulted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "collateralSeized",
            "type": "u64"
          },
          {
            "name": "outstandingPrincipal",
            "type": "u64"
          },
          {
            "name": "outstandingInterest",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "loanSettled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loan",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "repayment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
