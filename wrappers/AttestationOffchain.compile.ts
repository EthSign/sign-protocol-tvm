import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
  lang: 'func',
  targets: ['contracts/imports/constants.fc', 'contracts/imports/stdlib.fc', 'contracts/attestation_offchain.fc'],
};
