import { Address, Cell } from '@ton/core';
import { Attestation, Schema } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';
import { TonClient } from '@ton/ton';
import { SmartContract } from 'ton-contract-executor';

const ATTESTATION_ADDRESS = '0QBLcs5d-ZMY7vHez0ET7BBc8OEmiS_cb9kLhpyThqwT9EHM';

export async function run(provider: NetworkProvider) {
  const attestation = provider.open(Attestation.createFromAddress(Address.parse(ATTESTATION_ADDRESS)));

  console.log('Attestation', ATTESTATION_ADDRESS, await attestation.getAttestationData());

  // debug
  // const contractAddress = Address.parse(SCHEMA_ADDRESS);
  // let client = new TonClient({
  //   endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  // });
  // let state = await client.getContractState(contractAddress);
  // let code = Cell.fromBoc(state.code!)[0];
  // let data = Cell.fromBoc(state.data!)[0];
  // const signProtocolLog = await SmartContract.fromCell(code, data, {
  //   debug: true,
  // });
  // const result = await signProtocolLog.invokeGetMethod('get_schema_data', []);

  // console.log('Result', result.logs, result.type);
}
