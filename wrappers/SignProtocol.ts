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

export type SignProtocolConfig = {
  version: number;
  adminAddress: Slice;
  paused: boolean;
  schemaCounter: number;
  attestationCounter: number;
  initialSchemaCounter: number;
  initialAttestationCounter: number;
  attestationCode: Cell;
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

  async get_version(provider: ContractProvider) {
    const result = await provider.get('get_version', []);
    return result.stack.readBigNumber();
  }

  async get_schema_counter(provider: ContractProvider) {
    const result = await provider.get('get_schema_counter', []);
    return result.stack.readBigNumber();
  }

  async get_attestation_counter(provider: ContractProvider) {
    const result = await provider.get('get_attestation_counter', []);
    return result.stack.readBigNumber();
  }
}
