import { Address } from '@ton/core';
import { SchemaConfig, SignProtocol } from '../wrappers';
import { NetworkProvider } from '@ton/blueprint';
import { DataLocation, getRegisterHashCell, signCell } from '../utils';
import { mnemonicToWalletKey } from 'ton-crypto';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );
  const keyPair = await mnemonicToWalletKey((process.env.ADMIN_ADDRESS ?? '').split(' '));
  const schema: SchemaConfig = {
    data: 'Test',
    dataLocation: DataLocation.ONCHAIN,
    maxValidFor: new Date('2025-01-01'),
    timestamp: new Date('2024-05-22T08:47:42.589Z'),
    registrant: Address.parse(process.env.ADMIN_ADDRESS ?? ''),
    registrantPubKey: keyPair.publicKey,
    revocable: true,
    schemaCounterId: 17,
  };
  // const cellToSign = getRegisterHashCell(schema);
  // const { signature } = await signCell(cellToSign, process.env.WALLET_MNEMONIC ?? '');

  console.log('Schema', schema);

  console.log(await signProtocol.getSchemaId(schema));

  // debug
  // const contractAddress = Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '');
  // let client = new TonClient({
  //   endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  // });
  // let state = await client.getContractState(contractAddress);
  // let code = Cell.fromBoc(state.code!)[0];
  // let data = Cell.fromBoc(state.data!)[0];
  // const signProtocolLog = await SmartContract.fromCell(code, data, {
  //   debug: true,
  // });

  // const messageBody = beginCell()
  //   .storeUint(0, 4)
  //   .storeUint(OpCode.Register, 32)
  //   .storeUint(0, 64)
  //   .storeAddress(provider.sender().address)
  //   .storeBuffer(Buffer.from(signature))
  //   .storeRef(schemaCell)
  //   .endCell();
  // const result = await signProtocolLog.sendInternalMessage(
  //   internal({
  //     dest: schemaId,
  //     value: 1n,
  //     bounce: true,
  //     body: messageBody,
  //   }),
  // );

  // console.log('Result', result.logs, result.type);
}
