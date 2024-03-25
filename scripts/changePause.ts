import { Address } from '@ton/core';
import { SignProtocol } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );

  const pause = await signProtocol.getPaused();

  console.log('Current Pause', pause);

  await signProtocol.getChangePause(provider.sender(), !pause);
}
