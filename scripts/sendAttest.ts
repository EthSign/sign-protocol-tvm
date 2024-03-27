import { Address, Cell, beginCell } from '@ton/core';
import { AttestationConfig, Schema, SignProtocol, attestationConfigToCell, schemaConfigToCell } from '../wrappers';
import { NetworkProvider, compile } from '@ton/blueprint';
import { DataLocation, OpCode, getAttestHashCell, getContractAddress, signCell } from '../utils';
import { mnemonicToWalletKey } from 'ton-crypto';
import { SmartContract, internal } from 'ton-contract-executor';
import { TonClient } from '@ton/ton';

const SCHEMA_ADDRESS = '0QALD9iIZtk1xgmYo2Fp2sF8WlOGkYL3K-I9GTCuhENdCksQ';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );
  const schema = provider.open(Schema.createFromAddress(Address.parse(SCHEMA_ADDRESS)));
  const keyPair = await mnemonicToWalletKey((process.env.ADMIN_ADDRESS ?? '').split(' '));
  const schemaData = await schema.getSchemaData();
  const attestation: AttestationConfig = {
    attestationCounterId: await signProtocol.getAttestationCounter(),
    attester: Address.parse(process.env.ADMIN_ADDRESS ?? ''),
    attesterPubKey: keyPair.publicKey,
    attestTimestamp: new Date(),
    data: 'Test',
    dataLocation: DataLocation.ONCHAIN,
    linkedAttestationCounterId: 0,
    recipients: [Address.parse('0QCARrT22CU-HPc4boV9LDcMb-4uA04QF_7UpkqMsDDNadUU')],
    schemaCounterId: schemaData.schemaCounterId,
    schemaId: Address.parse(SCHEMA_ADDRESS),
    validUntil: new Date('2024-12-12'),
  };
  const cellToSign = getAttestHashCell(attestation);
  const { signature } = await signCell(cellToSign, process.env.WALLET_MNEMONIC ?? '');

  console.log('Attestation Id', attestation);
  console.log('Schema', schemaData);

  await signProtocol.sendAttest(provider.sender(), attestation, schemaData, signature);

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
  //   .storeUint(OpCode.Attest, 32)
  //   .storeUint(0, 64)
  //   .storeAddress(provider.sender().address)
  //   .storeBuffer(Buffer.from(signature))
  //   .storeRef(attestationCell)
  //   .storeRef(schemaConfigToCell(schemaData))
  //   .endCell();
  // const result = await signProtocolLog.sendInternalMessage(
  //   internal({
  //     dest: attestationId,
  //     value: 1n,
  //     bounce: true,
  //     body: messageBody,
  //   }),
  // );

  // console.log('Result', result.logs, result.type);
}
