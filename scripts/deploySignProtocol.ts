import { Address, Slice, beginCell, toNano } from '@ton/core';
import { SignProtocol } from '../wrappers/SignProtocol';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const cell = beginCell()
    .storeAddress(Address.parse(process.env.ADDRESS ?? ''))
    .endCell();
  const signProtocol = provider.open(
    SignProtocol.createFromConfig(
      {
        adminAddress: cell.asSlice(),
        version: 1,
        paused: false,
        schemaCounter: 0,
        attestationCounter: 0,
        initialSchemaCounter: 0,
        initialAttestationCounter: 0,
        attestationCode: beginCell().endCell(),
        schemaCode: beginCell().endCell(),
      },
      await compile('SignProtocol'),
    ),
  );

  await signProtocol.sendDeploy(provider.sender(), toNano('0.05'));

  await provider.waitForDeploy(signProtocol.address);

  console.log('Version', await signProtocol.get_version());
  console.log('Schema Count', await signProtocol.get_schema_counter());
  console.log('Attestation Count', await signProtocol.get_attestation_counter());
}
