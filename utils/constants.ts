export const OP_CODES = {
  ChangeAdmin: 1178663965,
  ChangePaused: 2809239666,
  RevokeAttestation: 1855247948,
  Attest: 2012962245,
};

export const ERROR_CODES = {
  Paused: 0x9e87fac8,
  SchemaNonexistent: 0x38f8c6c4,
  SchemaWrongRegistrant: 0x71984561,
  AttestationIrrevocable: 0x8ac42f49,
  AttestationNonexistent: 0x54681a13,
  AttestationInvalidDuration: 0xa65e02ed,
  AttestationAlreadyRevoked: 0xd8c3da86,
  AttestationWrongAttester: 0xa9ad2007,
  OffchainAttestationExists: 0xc83e3cdf,
  OffchainAttestationNonexistent: 0xa006519a,
  OffchainAttestationAlreadyRevoked: 0xa0671d20,
  InvalidDelegateSignature: 0xfdf4e6f9,
  LegacySPRequired: 0x5c34b9cc,
  UnknownOP: 0xffff,
  ExpiredMessage: 0x20,
  RepeatedMessage: 0x21,
  InvalidSignature: 0x22,
  Unauthorized: 0x23,
};
