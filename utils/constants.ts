export enum OpCode {
  ChangeAdmin = 1178663965, // 0x4641444d
  ChangeCode = 1476445391, // 0x58585857
  ChangePaused = 2809239666, // 0xa8a8a8a2
  ChangeVersion = 1564829953, // 0x5d5d5d61
  Withdraw = 1944962002, // 0x73737372
  Register = 2580208728, // 0x9a9a9a98
  RegisterBatch = 3264080167, // 0xc3c3c3c7
  Attest = 2012962245, // 0x78787875
  AttestWithFees = 614542284, // 0x25252524
  AttestBatch = 68687862, // 0x4242423
  AttestBatchWithFees = 1007055706, // 0x3c3c3c3a
  AttestOffchain = 2312912215, // 0x89898987
  AttestOffchainBatch = 1329274542, // 0x4f4f4f4e
  Revoke = 3758908980, // 0xe4e4e4e4
  RevokeWithFees = 2827667333, // 0xa9a9a9a5
  RevokeBatch = 4023047350, // 0xefefefee
  RevokeBatchWithFees = 1718208763, // 0x6666666b
  RevokeOffchain = 1900840713, // 0x71717169
  RevokeOffchainBatch = 627024976, // 0x25252530
  RevokeAttestation = 1855247948, // 0x6f6f6f6c
}

export enum CodeType {
  Schema = 1215727316, // 0x48535344
  Attestation = 3211613399, // 0xbeefbeef
  AttestationOffchain = 1694929748, // 0x646f6e65
  SP = 3139718556, // 0xba5eba5e
}

export enum Actions {
  Register = 2580208728, // 0x9a9a9a98
  RegisterBatch = 3264080167, // 0xc3c3c3c7
  Attest = 2012962245, // 0x78787875
  AttestBatch = 68687862, // 0x4242423
  AttestOffchain = 2312912215, // 0x89898987
  AttestOffchainBatch = 1329274542, // 0x4f4f4f4e
  Revoke = 3758908980, // 0xe4e4e4e4
  RevokeBatch = 4023047350, // 0xefefefee
  RevokeOffchain = 1900840713, // 0x71717169
  RevokeOffchainBatch = 627024976, // 0x25252530
}

export enum ErrorCode {
  Paused = 0x9e87fac8, // 2660000008
  SchemaNonexistent = 0x38f8c6c4, // 952000004
  SchemaWrongRegistrant = 0x71984561, // 1900000001
  AttestationIrrevocable = 0x8ac42f49, // 2320000009
  AttestationNonexistent = 0x54681a13, // 141000004
  AttestationInvalidDuration = 0xa65e02ed, // 2770000013
  AttestationAlreadyRevoked = 0xd8c3da86, // 3620000006
  AttestationWrongAttester = 0xa9ad2007, // 280000007
  OffchainAttestationExists = 0xc83e3cdf, // 3320000063
  OffchainAttestationNonexistent = 0xa006519a, // 2680000154
  OffchainAttestationAlreadyRevoked = 0xa0671d20, // 2680000032
  InvalidDelegateSignature = 0xfdf4e6f9, // 427000001
  LegacySPRequired = 0x5c34b9cc, // 1540000028
  UnknownOP = 0xffff, // 65535
  ExpiredMessage = 0x20, // 32
  RepeatedMessage = 0x21, // 33
  InvalidSignature = 0x22, // 34
  Unauthorized = 0x23, // 35
}

export enum DataLocation {
  ONCHAIN = 0,
  ARWEAVE = 1,
  IPFS = 2,
  CUSTOM = 3,
}
