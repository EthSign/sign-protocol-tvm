import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
  lang: 'func',
  targets: [
    'node_modules/@ston-fi/funcbox/autoload.fc',
    'contracts/imports/stdlib.fc',
    'contracts/imports/constants.fc',
    'contracts/imports/utils.fc',
    'contracts/imports/definitions.fc',
    'contracts/operations/hash_ops.fc',
    'contracts/operations/helper_ops.fc',
    'contracts/operations/register_ops.fc',
    'contracts/operations/attest_ops.fc',
    'contracts/operations/revoke_ops.fc',
    'contracts/sign_protocol.fc',
  ],
};
