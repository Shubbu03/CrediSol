/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/attestation_registry.json`.
 */
export type AttestationRegistry = {
  "address": "AQ4NQuyNkn9cmDmNpc3HzepHahPM8fWP255pHqrzWPBr",
  "metadata": {
    "name": "attestationRegistry",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addIssuer",
      "discriminator": [
        252,
        97,
        3,
        221,
        65,
        162,
        177,
        32
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
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
        },
        {
          "name": "issuerType",
          "type": {
            "defined": {
              "name": "issuerType"
            }
          }
        }
      ]
    },
    {
      "name": "addSchema",
      "discriminator": [
        133,
        191,
        60,
        139,
        221,
        213,
        46,
        170
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
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
          "name": "schema",
          "type": {
            "defined": {
              "name": "schemaType"
            }
          }
        }
      ]
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
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
          "name": "maxExpiry",
          "type": "u64"
        }
      ]
    },
    {
      "name": "postAttestation",
      "discriminator": [
        12,
        75,
        255,
        83,
        59,
        171,
        141,
        27
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "issuer"
        },
        {
          "name": "subject"
        },
        {
          "name": "attestation",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "schemaId",
          "type": {
            "defined": {
              "name": "schemaType"
            }
          }
        },
        {
          "name": "claimHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "expiryTs",
          "type": "i64"
        },
        {
          "name": "signatureBytes",
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
        },
        {
          "name": "allocatorFromProof",
          "type": {
            "array": [
              "u8",
              65
            ]
          }
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "removeIssuer",
      "discriminator": [
        0,
        75,
        88,
        225,
        4,
        159,
        167,
        119
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
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
          "name": "attestation",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
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
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
      "name": "setIssuerStatus",
      "discriminator": [
        31,
        160,
        75,
        115,
        119,
        98,
        91,
        15
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
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
        },
        {
          "name": "enabled",
          "type": "bool"
        }
      ]
    },
    {
      "name": "setMaxExpiry",
      "discriminator": [
        160,
        189,
        97,
        86,
        209,
        226,
        190,
        104
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
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
          "name": "maxExpiry",
          "type": "u64"
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
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
      "name": "updateExpiry",
      "discriminator": [
        137,
        72,
        245,
        243,
        100,
        25,
        17,
        25
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  116,
                  116,
                  101,
                  115,
                  116,
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
          "name": "attestation",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newExpiry",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "attestation",
      "discriminator": [
        152,
        125,
        183,
        86,
        36,
        146,
        121,
        73
      ]
    },
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
      "name": "attestationExpiryUpdated",
      "discriminator": [
        199,
        104,
        246,
        172,
        52,
        177,
        28,
        116
      ]
    },
    {
      "name": "attestationPosted",
      "discriminator": [
        142,
        97,
        81,
        56,
        69,
        155,
        19,
        243
      ]
    },
    {
      "name": "attestationRevoked",
      "discriminator": [
        47,
        106,
        65,
        238,
        200,
        127,
        163,
        50
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
      "name": "issuerAdded",
      "discriminator": [
        209,
        200,
        242,
        175,
        69,
        177,
        80,
        190
      ]
    },
    {
      "name": "issuerRemoved",
      "discriminator": [
        53,
        135,
        144,
        62,
        36,
        70,
        245,
        230
      ]
    },
    {
      "name": "issuerStatusChanged",
      "discriminator": [
        130,
        171,
        24,
        46,
        255,
        61,
        237,
        157
      ]
    },
    {
      "name": "maxExpiryChanged",
      "discriminator": [
        225,
        53,
        169,
        52,
        122,
        44,
        117,
        85
      ]
    },
    {
      "name": "pauseChanged",
      "discriminator": [
        238,
        188,
        213,
        78,
        134,
        209,
        178,
        218
      ]
    },
    {
      "name": "schemaAdded",
      "discriminator": [
        78,
        67,
        86,
        69,
        239,
        185,
        88,
        81
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "paused",
      "msg": "The registry is paused"
    },
    {
      "code": 6001,
      "name": "issuerNotFound",
      "msg": "Issuer not found in registry"
    },
    {
      "code": 6002,
      "name": "issuerAlreadyExists",
      "msg": "Issuer already exists"
    },
    {
      "code": 6003,
      "name": "issuerDisabled",
      "msg": "Issuer is disabled"
    },
    {
      "code": 6004,
      "name": "tooManyIssuers",
      "msg": "Too many issuers"
    },
    {
      "code": 6005,
      "name": "schemaNotAllowed",
      "msg": "Schema not allowed"
    },
    {
      "code": 6006,
      "name": "schemaNotFound",
      "msg": "Schema not found"
    },
    {
      "code": 6007,
      "name": "schemaAlreadyExists",
      "msg": "Schema already exists"
    },
    {
      "code": 6008,
      "name": "tooManySchemas",
      "msg": "Too many schemas"
    },
    {
      "code": 6009,
      "name": "invalidExpiry",
      "msg": "Invalid expiry timestamp"
    },
    {
      "code": 6010,
      "name": "expiryTooFar",
      "msg": "Expiry timestamp is too far in the future"
    },
    {
      "code": 6011,
      "name": "alreadyRevoked",
      "msg": "Attestation already revoked"
    },
    {
      "code": 6012,
      "name": "unauthorized",
      "msg": "Unauthorized: must be issuer or admin"
    },
    {
      "code": 6013,
      "name": "invalidAdmin",
      "msg": "Invalid admin address"
    },
    {
      "code": 6014,
      "name": "invalidSignature",
      "msg": "Invalid signature"
    },
    {
      "code": 6015,
      "name": "unsupportedIssuerType",
      "msg": "Unsupported issuer type"
    },
    {
      "code": 6016,
      "name": "invalidPublicKey",
      "msg": "Invalid Public Key"
    }
  ],
  "types": [
    {
      "name": "adminChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldAdmin",
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "attestation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "schemaId",
            "type": {
              "defined": {
                "name": "schemaType"
              }
            }
          },
          {
            "name": "claimHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "issuedAt",
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
      "name": "attestationExpiryUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "schemaId",
            "type": {
              "defined": {
                "name": "schemaType"
              }
            }
          },
          {
            "name": "newExpiryTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "attestationPosted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "schemaId",
            "type": {
              "defined": {
                "name": "schemaType"
              }
            }
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "claimHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "expiryTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "attestationRevoked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "schemaId",
            "type": {
              "defined": {
                "name": "schemaType"
              }
            }
          },
          {
            "name": "issuer",
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
            "name": "maxExpirySecs",
            "type": "i64"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "issuers",
            "type": {
              "vec": {
                "defined": {
                  "name": "issuer"
                }
              }
            }
          },
          {
            "name": "schemas",
            "type": {
              "vec": {
                "defined": {
                  "name": "schemaType"
                }
              }
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
            "name": "maxExpirySecs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "issuer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "issuerType",
            "type": {
              "defined": {
                "name": "issuerType"
              }
            }
          },
          {
            "name": "enabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "issuerAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "issuerRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "issuerStatusChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "enabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "issuerType",
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "solana"
          },
          {
            "name": "ethereum"
          }
        ]
      }
    },
    {
      "name": "maxExpiryChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maxExpirySecs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "pauseChanged",
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
      "name": "schemaAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "schema",
            "type": {
              "defined": {
                "name": "schemaType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "schemaType",
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "anonAadhaar"
          },
          {
            "name": "zkPassIdentity"
          },
          {
            "name": "uniqueness"
          },
          {
            "name": "creditKarmaScore"
          },
          {
            "name": "plaidIncome"
          },
          {
            "name": "custom"
          }
        ]
      }
    }
  ]
};
