export abstract class Op {
  static change_admin = 1178663965;
  static revoke_attestation = 1855247948;
  static attest = 2012962245;
}

export abstract class Errors {
  static paused = 0x9e87fac8;
  static schema_nonexistent = 0x38f8c6c4;
  static schema_wrong_registrant = 0x71984561;
  static attestation_irrevocable = 0x8ac42f49;
  static attestation_nonexistent = 0x54681a13;
  static attestation_invalid_duration = 0xa65e02ed;
  static attestation_already_revoked = 0xd8c3da86;
  static attestation_wrong_attester = 0xa9ad2007;
  static offchain_attestation_exists = 0xc83e3cdf;
  static offchain_attestation_nonexistent = 0xa006519a;
  static offchain_attestation_already_revoked = 0xa0671d20;
  static invalid_delegate_signature = 0xfdf4e6f9;
  static legacy_sp_required = 0x5c34b9cc;
  static unknown_op = 0xffff;
}
