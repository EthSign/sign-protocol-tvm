import { Address, toNano } from '@ton/core';
import { SignProtocol } from '../wrappers/SignProtocol';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const attestationCode = await compile('Attestation');
  const attestationOffchainCode = await compile('AttestationOffchain');
  const schemaCode = await compile('Schema');
  const signProtocolCode = await compile('SignProtocol');
  const signProtocol = provider.open(
    SignProtocol.createFromConfig(
      {
        adminAddress: Address.parse(process.env.ADMIN_ADDRESS ?? ''),
        version: '1.0.0',
        paused: false,
        schemaCounter: 0,
        attestationCounter: 0,
        attestationCode,
        attestationOffchainCode,
        schemaCode,
      },
      signProtocolCode,
    ),
  );

  await signProtocol.sendDeploy(provider.sender(), toNano('0.1'));

  await provider.waitForDeploy(signProtocol.address);

  console.log('Version', await signProtocol.getVersion());
  console.log('Schema Count', await signProtocol.getSchemaCounter());
  console.log('Attestation Count', await signProtocol.getAttestationCounter());
}
