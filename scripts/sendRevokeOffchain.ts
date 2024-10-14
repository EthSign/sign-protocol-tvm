import { Address, Cell, beginCell, toNano } from '@ton/core';
import {
  AttestationOffchain,
  AttestationOffchainConfig,
  Schema,
  SignProtocol,
  attestationOffchainConfigToCell,
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

const ATTESTATION_ADDRESS = 'kQAxXIA3EErik9ktGedskRMHKLftVZRE-rodQnWBL20qAkHe';

export async function run(provider: NetworkProvider) {
  const signProtocol = provider.open(
    SignProtocol.createFromAddress(Address.parse(process.env.SIGN_PROTOCOL_ADDRESS ?? '')),
  );
  const attestationAddress = Address.parse(ATTESTATION_ADDRESS);
  const attestation = provider.open(AttestationOffchain.createFromAddress(attestationAddress));
  const attestationData = await attestation.getOffchainAttestationData();
  const reason = 'Test';
  const cellToSign = getRevokeHashCell(attestationAddress, reason);
  const { signature } = await signCell(cellToSign, process.env.WALLET_MNEMONIC ?? '');

  console.log('Attestation', attestationData);

  // await attestation.sendRevokeAttestation(provider.sender(), schemaData);

  await signProtocol.sendRevokeAttestationOffchain(
    provider.sender(),
    attestationAddress,
    attestationData,
    signature ?,
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
  //   .storeUint(OpCode.RevokeAttestation, 32)
  //   .storeUint(0, 64)
  //   .storeAddress(provider.sender().address)
  //   .storeBuffer(Buffer.from(signature), 64)
  //   .storeRef(beginCell().storeAddress(attestationAddress).storeUint(stringToInt(reason), 256).endCell())
  //   // .storeRef(attestationConfigToCell(attestationData))
  //   .storeRef(schemaConfigToCell(schemaData))
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
