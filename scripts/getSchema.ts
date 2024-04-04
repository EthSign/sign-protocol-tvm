import { Address } from '@ton/core';
import { Schema } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';

const SCHEMA_ADDRESS = 'kQAuywgroS_S07WC1RvuCECXXOB8uYrFT-w6_Mdi3kZEdqt3';

export async function run(provider: NetworkProvider) {
  const schema = provider.open(Schema.createFromAddress(Address.parse(SCHEMA_ADDRESS)));

  console.log('Schema', SCHEMA_ADDRESS, await schema.getSchemaData());

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
