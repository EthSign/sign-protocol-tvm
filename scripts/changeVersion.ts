import { Address } from '@ton/core';
import { SignProtocol } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );

  const version = await signProtocol.getVersion();

  console.log('Current Version', version);

  await signProtocol.sendChangeVersion(provider.sender(), '1.0.0');
}
