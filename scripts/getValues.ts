import { Address } from '@ton/core';
import { SignProtocol } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );

  console.log('Version', await signProtocol.getVersion());
  console.log('Attestation Count', await signProtocol.getAttestationCounter());
  console.log('Schema Count', await signProtocol.getSchemaCounter());
  console.log('Paused', await signProtocol.getPaused());
}
