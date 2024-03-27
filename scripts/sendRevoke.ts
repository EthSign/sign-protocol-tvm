import { Address, Cell, beginCell } from '@ton/core';
import {
  Attestation,
  AttestationConfig,
  Schema,
  SignProtocol,
  attestationConfigToCell,
  schemaConfigToCell,
} from '../wrappers';
import { NetworkProvider, compile } from '@ton/blueprint';
import {
  DataLocation,
  OpCode,
  getAttestHashCell,
  getContractAddress,
  getRevokeHashCell,
  signCell,
  stringToInt,
} from '../utils';
import { mnemonicToWalletKey } from 'ton-crypto';
import { SmartContract, internal } from 'ton-contract-executor';
import { TonClient } from '@ton/ton';

const ATTESTATION_ADDRESS = '0QBLcs5d-ZMY7vHez0ET7BBc8OEmiS_cb9kLhpyThqwT9EHM';
const SCHEMA_ADDRESS = '0QALD9iIZtk1xgmYo2Fp2sF8WlOGkYL3K-I9GTCuhENdCksQ';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );
  const schema = provider.open(Schema.createFromAddress(Address.parse(SCHEMA_ADDRESS)));
  const attestationAddress = Address.parse(ATTESTATION_ADDRESS);
  const attestation = provider.open(Attestation.createFromAddress(attestationAddress));
  const schemaData = await schema.getSchemaData();
  const attestationData = await attestation.getAttestationData();
  const reason = 'Test';
  const cellToSign = getRevokeHashCell(attestationAddress, reason);
  const { signature } = await signCell(cellToSign, process.env.WALLET_MNEMONIC ?? '');

  console.log('Attestation', attestationData);
  console.log('Schema', schemaData);

  await signProtocol.sendRevokeAttestation(
    provider.sender(),
    attestationAddress,
    attestationData,
    schemaData,
    signature,
    reason,
  );

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
  //   .storeBuffer(Buffer.from(signature), 64)
  //   .storeAddress(attestationAddress)
  //   .storeRef(attestationConfigToCell(attestationData))
  //   .storeRef(schemaConfigToCell(schemaData))
  //   .storeUint(stringToInt(reason), 256)
  //   .endCell();
  // const result = await signProtocolLog.sendInternalMessage(
  //   internal({
  //     dest: attestationAddress,
  //     value: 1n,
  //     bounce: true,
  //     body: messageBody,
  //   }),
  // );

  // console.log('Result', result.logs, result.type);
}
