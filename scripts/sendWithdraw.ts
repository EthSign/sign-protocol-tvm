import { Address } from '@ton/core';
import { SignProtocol } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );

  const amount = '0.19';

  console.log('Withdrawing', amount);

  await signProtocol.sendWithdraw(provider.sender(), amount);
}
