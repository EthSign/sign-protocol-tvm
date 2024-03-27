import { Address } from '@ton/core';
import { SignProtocol } from '../wrappers';
import { NetworkProvider, compile } from '@ton/blueprint';
import { CodeType } from '../utils';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );

  console.log('Updating Attestation Code', process.env.SIGN_PROTOCOL_ADDRESS);

  await signProtocol.sendChangeCode(provider.sender(), CodeType.Attestation, await compile('Attestation'));
}
