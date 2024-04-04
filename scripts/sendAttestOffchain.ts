import { Address, Cell, beginCell, toNano } from '@ton/core';
import {
  AttestationConfig,
  AttestationOffchainConfig,
  Schema,
  SignProtocol,
  attestationOffchainConfigToCell,
} from '../wrappers';
import { NetworkProvider, compile } from '@ton/blueprint';
import {
  DataLocation,
  OpCode,
  getAttestHashCell,
  getAttestOffchainHashCell,
  getContractAddress,
  signCell,
} from '../utils';
import { mnemonicToWalletKey } from 'ton-crypto';
import { TonClient } from '@ton/ton';
import { SmartContract, internal } from 'ton-contract-executor';

const SCHEMA_ADDRESS = 'kQAuywgroS_S07WC1RvuCECXXOB8uYrFT-w6_Mdi3kZEdqt3';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );
  const schema = provider.open(Schema.createFromAddress(Address.parse(SCHEMA_ADDRESS)));
  const attester = Address.parse(process.env.ADMIN_ADDRESS ?? '');
  const keyPair = await mnemonicToWalletKey((process.env.ADMIN_ADDRESS ?? '').split(' '));
  const schemaData = await schema.getSchemaData();
  const attestation: AttestationOffchainConfig = {
    attester: Address.parse(process.env.ADMIN_ADDRESS ?? ''),
    attesterPubKey: keyPair.publicKey,
  };
  const cellToSign = getAttestOffchainHashCell(attestation);
  const { signature } = await signCell(cellToSign, process.env.WALLET_MNEMONIC ?? '');

  console.log('Attestation', attestation);
  console.log('Schema', schemaData);

  await signProtocol.sendAttestOffchain(provider.sender(), attester, attestation, signature);

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
  //   .storeUint(OpCode.AttestOffchain, 32)
  //   .storeUint(0, 64)
  //   .storeAddress(provider.sender().address)
  //   .storeBuffer(Buffer.from(signature))
  //   .storeRef(attestationOffchainConfigToCell(attestation))
  //   .storeRef(beginCell().storeAddress(attester).endCell())
  //   .endCell();
  // const result = await signProtocolLog.sendInternalMessage(
  //   internal({
  //     dest: getContractAddress(await compile('AttestationOffchain'), attestationOffchainConfigToCell(attestation)),
  //     value: 1n,
  //     bounce: true,
  //     body: messageBody,
  //   }),
  // );

  // console.log('Result', result.logs, result.type);
}
