import { Address } from '@ton/core';
import { Attestation } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';

const ATTESTATION_ADDRESS = 'kQAxXIA3EErik9ktGedskRMHKLftVZRE-rodQnWBL20qAkHe';

export async function run(provider: NetworkProvider) {
  const attestation = provider.open(Attestation.createFromAddress(Address.parse(ATTESTATION_ADDRESS)));

  console.log('Attestation', ATTESTATION_ADDRESS, await attestation.getAttestationData());

  // debug
  // const contractAddress = Address.parse(ATTESTATION_ADDRESS);
  // let client = new TonClient({
  //   endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  // });
  // let state = await client.getContractState(contractAddress);
  // let code = Cell.fromBoc(state.code!)[0];
  // let data = Cell.fromBoc(state.data!)[0];
  // const signProtocolLog = await SmartContract.fromCell(code, data, {
  //   debug: true,
  // });
  // const result = await signProtocolLog.invokeGetMethod('get_attestation_data', []);

  // console.log('Result', result.logs, result.type);
}
