import { Address, beginCell, toNano } from '@ton/core';
import { SignProtocol } from '../wrappers/SignProtocol';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const cellAddress = beginCell()
    .storeAddress(Address.parse(process.env.ADDRESS ?? ''))
    .endCell();
  const attestationCode = await compile('Attestation');
  const schemaCode = await compile('Schema');
  const signProtocolCode = await compile('SignProtocol');
  const signProtocol = provider.open(
    SignProtocol.createFromConfig(
      {
        adminAddress: cellAddress.asSlice(),
        version: 1,
        paused: false,
        schemaCounter: 0,
        attestationCounter: 0,
        initialSchemaCounter: 0,
        initialAttestationCounter: 0,
        attestationCode,
        schemaCode,
      },
      signProtocolCode,
    ),
  );

  await signProtocol.sendDeploy(provider.sender(), toNano('0.02'));

  await provider.waitForDeploy(signProtocol.address);

  console.log('Version', await signProtocol.get_version());
  console.log('Schema Count', await signProtocol.get_schema_counter());
  console.log('Attestation Count', await signProtocol.get_attestation_counter());
}
