import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  Slice,
} from '@ton/core';
import { OP_CODES } from '../utils';

export type SignProtocolConfig = {
  version: number;
  adminAddress: Slice;
  paused: boolean;
  schemaCounter: number;
  attestationCounter: number;
  initialSchemaCounter: number;
  initialAttestationCounter: number;
  attestationCode: Cell;
  attestationOffchainCode: Cell;
  schemaCode: Cell;
};

export function signProtocolConfigToCell(config: SignProtocolConfig): Cell {
  const {
    version,
    adminAddress,
    paused,
    schemaCounter,
    attestationCounter,
    initialSchemaCounter,
    initialAttestationCounter,
    attestationCode,
    attestationOffchainCode,
    schemaCode,
  } = config;

  return beginCell()
    .storeUint(version, 64)
    .storeSlice(adminAddress)
    .storeUint(Number(paused), 1)
    .storeUint(schemaCounter, 64)
    .storeUint(attestationCounter, 64)
    .storeUint(initialSchemaCounter, 64)
    .storeUint(initialAttestationCounter, 64)
    .storeRef(attestationCode)
    .storeRef(attestationOffchainCode)
    .storeRef(schemaCode)
    .endCell();
}

export class SignProtocol implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new SignProtocol(address);
  }

  static createFromConfig(config: SignProtocolConfig, code: Cell, workchain = 0) {
    const data = signProtocolConfigToCell(config);
    const init = { code, data };
    return new SignProtocol(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getVersion(provider: ContractProvider): Promise<number> {
    const result = await provider.get('get_version', []);
    return Number(result.stack.readBigNumber());
  }

  async getPaused(provider: ContractProvider): Promise<boolean> {
    const result = await provider.get('get_paused', []);
    return Boolean(result.stack.readNumber());
  }

  async getSchemaCounter(provider: ContractProvider): Promise<number> {
    const result = await provider.get('get_schema_counter', []);
    return Number(result.stack.readBigNumber());
  }

  async getAttestationCounter(provider: ContractProvider): Promise<number> {
    const result = await provider.get('get_attestation_counter', []);
    return Number(result.stack.readBigNumber());
  }

  async getChangePause(provider: ContractProvider, via: Sender, paused: boolean) {
    const messageBody = beginCell()
      .storeUint(0, 4)
      .storeUint(OP_CODES.ChangePaused, 32)
      .storeUint(0, 64)
      .storeAddress(via.address)
      .storeUint(Number(paused), 1)
      .endCell();
    const result = await provider.internal(via, {
      value: '0.01',
      body: messageBody,
    });

    return result;
  }
}
