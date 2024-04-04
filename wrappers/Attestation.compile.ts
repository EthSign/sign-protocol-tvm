import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
  lang: 'func',
  targets: [
    'node_modules/@ston-fi/funcbox/autoload.fc',
    'contracts/imports/constants.fc',
    'contracts/imports/definitions_helpers.fc',
    'contracts/imports/stdlib.fc',
    'contracts/imports/utils.fc',
    'contracts/operations/hash_ops.fc',
    'contracts/attestation.fc',
  ],
};
