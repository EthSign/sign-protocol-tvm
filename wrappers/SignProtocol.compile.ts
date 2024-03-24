import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
  lang: 'func',
  targets: [
    'contracts/imports/constants.fc',
    'contracts/imports/stdlib.fc',
    'node_modules/@ston-fi/funcbox/autoload.fc',
    'contracts/sign_protocol.fc',
  ],
};
