/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/score_attestor.json`.
 */
export type ScoreAttestor = {
  "address": "5xsKPzfNAZz7bxpPLFLhWwb7QaZ9ueNuos6Hr3WMh8S5",
  "metadata": {
    "name": "scoreAttestor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
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
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "attestor",
          "type": "pubkey"
        },
        {
          "name": "secp256k1Pubkey",
          "type": {
            "array": [
              "u8",
              65
            ]
          }
        }
      ]
    },
    {
      "name": "postScoreAttestation",
      "discriminator": [
        185,
        21,
        62,
        247,
        58,
        83,
        208,
        93
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "subject"
        },
        {
          "name": "loan"
        },
        {
          "name": "attestor",
          "writable": true,
          "signer": true
        },
        {
          "name": "score",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "subject"
              },
              {
                "kind": "account",
                "path": "loan"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "score",
          "type": "u16"
        },
        {
          "name": "grade",
          "type": "u8"
        },
        {
          "name": "pdBps",
          "type": "u32"
        },
        {
          "name": "recommendedMinCollateralBps",
          "type": "u16"
        },
        {
          "name": "expiryTs",
          "type": "i64"
        },
        {
          "name": "message",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "signature",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "recoverId",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revokeAttestation",
      "discriminator": [
        12,
        156,
        103,
        161,
        194,
        246,
        211,
        179
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "subject"
        },
        {
          "name": "loan"
        },
        {
          "name": "score",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "subject"
              },
              {
                "kind": "account",
                "path": "loan"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "setAdmin",
      "discriminator": [
        251,
        163,
        0,
        52,
        91,
        194,
        187,
        92
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setIssuer",
      "discriminator": [
        122,
        240,
        209,
        127,
        179,
        164,
        175,
        206
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "issuer",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setPaused",
      "discriminator": [
        91,
        60,
        125,
        192,
        176,
        225,
        166,
        218
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "setSecp256k1Pubkey",
      "discriminator": [
        185,
        65,
        192,
        104,
        104,
        218,
        6,
        107
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "secp256k1Pubkey",
          "type": {
            "array": [
              "u8",
              65
            ]
          }
        }
      ]
    },
    {
      "name": "updateAttestationExpiry",
      "discriminator": [
        216,
        135,
        140,
        69,
        159,
        251,
        27,
        162
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101,
                  95,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "subject"
        },
        {
          "name": "loan"
        },
        {
          "name": "score",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  111,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "subject"
              },
              {
                "kind": "account",
                "path": "loan"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newExpiryTs",
          "type": "i64"
        }
      ]
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
      "name": "scoreAttestation",
      "discriminator": [
        4,
        71,
        218,
        229,
        93,
        220,
        62,
        235
      ]
    }
  ],
  "events": [
    {
      "name": "adminChanged",
      "discriminator": [
        232,
        34,
        31,
        226,
        62,
        18,
        19,
        114
      ]
    },
    {
      "name": "configInitialized",
      "discriminator": [
        181,
        49,
        200,
        156,
        19,
        167,
        178,
        91
      ]
    },
    {
      "name": "pausedSet",
      "discriminator": [
        171,
        125,
        127,
        156,
        233,
        81,
        68,
        66
      ]
    },
    {
      "name": "scoreExpiryUpdated",
      "discriminator": [
        63,
        154,
        65,
        35,
        98,
        224,
        85,
        76
      ]
    },
    {
      "name": "scorePosted",
      "discriminator": [
        173,
        57,
        108,
        20,
        7,
        200,
        83,
        59
      ]
    },
    {
      "name": "scoreRevoked",
      "discriminator": [
        74,
        225,
        127,
        60,
        169,
        157,
        166,
        110
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedOracle",
      "msg": "Unauthorized oracle signer."
    },
    {
      "code": 6001,
      "name": "invalidExpiry",
      "msg": "Attestation expired or invalid."
    },
    {
      "code": 6002,
      "name": "invalidOracleThreshold",
      "msg": "Oracle threshold must be greater than zero"
    },
    {
      "code": 6003,
      "name": "invalidMaxStaleness",
      "msg": "Max staleness seconds must be greater than zero"
    },
    {
      "code": 6004,
      "name": "invalidParam",
      "msg": "Generic invalid parameter"
    },
    {
      "code": 6005,
      "name": "paused",
      "msg": "paused"
    },
    {
      "code": 6006,
      "name": "tooManyOracles",
      "msg": "Too many oracles"
    },
    {
      "code": 6007,
      "name": "oracleExists",
      "msg": "Oracle already exists"
    },
    {
      "code": 6008,
      "name": "oracleNotFound",
      "msg": "Oracle not found"
    },
    {
      "code": 6009,
      "name": "tooManyModels",
      "msg": "Too many models"
    },
    {
      "code": 6010,
      "name": "modelExists",
      "msg": "Model already exists"
    },
    {
      "code": 6011,
      "name": "modelNotFound",
      "msg": "Model not found"
    },
    {
      "code": 6012,
      "name": "modelNotAllowed",
      "msg": "Model not allowed or disabled"
    },
    {
      "code": 6013,
      "name": "insufficientOracleSigners",
      "msg": "Insufficient oracle signers"
    },
    {
      "code": 6014,
      "name": "invalidSignature",
      "msg": "Invalid signature"
    },
    {
      "code": 6015,
      "name": "unauthorizedAttestor",
      "msg": "Attestor unauthorized"
    }
  ],
  "types": [
    {
      "name": "adminChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAdmin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "attestor",
            "type": "pubkey"
          },
          {
            "name": "secp256k1Pubkey",
            "type": {
              "array": [
                "u8",
                65
              ]
            }
          }
        ]
      }
    },
    {
      "name": "configInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "attestor",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "pausedSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "scoreAttestation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u16"
          },
          {
            "name": "grade",
            "type": "u8"
          },
          {
            "name": "pdBps",
            "type": "u32"
          },
          {
            "name": "recommendedMinCollateralBps",
            "type": "u16"
          },
          {
            "name": "attestor",
            "type": "pubkey"
          },
          {
            "name": "postedAt",
            "type": "i64"
          },
          {
            "name": "expiryTs",
            "type": "i64"
          },
          {
            "name": "revoked",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "scoreExpiryUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "newExpiryTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "scorePosted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "loan",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u16"
          },
          {
            "name": "grade",
            "type": "u8"
          },
          {
            "name": "pdBps",
            "type": "u32"
          },
          {
            "name": "recommendedMinCollateralBps",
            "type": "u16"
          },
          {
            "name": "expiryTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "scoreRevoked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "loan",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
