import { Address, beginCell, Cell } from '@ton/core';
import { SchemaConfig, schemaConfigToCell, SignProtocol } from '../wrappers';
import { compile, NetworkProvider } from '@ton/blueprint';
import { DataLocation, getRegisterHashCell, OpCode, signCell } from '../utils';
import { mnemonicToWalletKey } from 'ton-crypto';
import { TonClient } from '@ton/ton';
import { internal, SmartContract } from 'ton-contract-executor';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );
  const keyPair = await mnemonicToWalletKey((process.env.ADMIN_ADDRESS ?? '').split(' '));
  const schema: SchemaConfig = {
    dataLen: 4,
    data: 'Test',
    dataLocation: DataLocation.ONCHAIN,
    maxValidFor: new Date('2025-01-01'),
    timestamp: new Date(),
    registrant: Address.parse(process.env.ADMIN_ADDRESS ?? ''),
    registrantPubKey: keyPair.publicKey,
    revocable: true,
    schemaId: await signProtocol.getSchemaCounter(),
    attestationCode: await compile('Attestation'),
    spAddress: Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? ''),
  };
  const cellToSign = getRegisterHashCell(schema);
  const { signature } = await signCell(cellToSign, process.env.WALLET_MNEMONIC ?? '');

  console.log('Schema', schema);

  // await signProtocol.sendRegisterSchema(provider.sender(), schema, signature);

  // debug
  const contractAddress = Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '');
  let client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  });
  let state = await client.getContractState(contractAddress);
  let code = Cell.fromBoc(state.code!)[0];
  let data = Cell.fromBoc(state.data!)[0];
  const signProtocolLog = await SmartContract.fromCell(code, data, {
    debug: true,
  });

  const schemaCell = schemaConfigToCell(schema);
  const messageBody = beginCell()
    .storeUint(OpCode.Register, 32)
    .storeUint(0, 64)
    .storeRef(schemaCell)
    .storeUint(1, 1)
    .storeBuffer(Buffer.from(signature))
    .storeUint(0, 1)
    .endCell();

  const result = await signProtocolLog.sendInternalMessage(
    internal({
      dest: contractAddress,
      value: 1n,
      bounce: true,
      body: messageBody,
    }),
  );

  console.log('Result', result.logs, result.type);
}
