import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
  Tuple,
  TupleItem,
} from '@ton/core';
import { CodeType, intToString, OpCode, stringToInt } from '../utils';
import { SchemaConfig, schemaConfigToCell } from './Schema';
import { AttestationConfig, attestationConfigToCell } from './Attestation';
import { AttestationOffchainConfig, attestationOffchainConfigToCell } from './AttestationOffchain';

export type SignProtocolConfig = {
  version: string;
  adminAddress: Address;
  paused: boolean;
  schemaCounter: number;
  attestationCounter: number;
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
    attestationCode,
    attestationOffchainCode,
    schemaCode,
  } = config;

  return beginCell()
    .storeUint(stringToInt(version), 64)
    .storeAddress(adminAddress)
    .storeUint(Number(paused), 1)
    .storeUint(schemaCounter, 64)
    .storeUint(attestationCounter, 64)
    .storeRef(attestationCode)
    .storeRef(attestationOffchainCode)
    .storeRef(schemaCode)
    .endCell();
}

export class SignProtocol implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) { }

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

  async getVersion(provider: ContractProvider): Promise<string> {
    const result = await provider.get('get_version', []);

    return intToString(Number(result.stack.readBigNumber()));
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

  async getAttestationId(provider: ContractProvider, attestation: AttestationConfig): Promise<Address> {
    const arg: TupleItem = {
      cell: attestationConfigToCell(attestation),
      type: 'cell',
    }
    const result = await provider.get('get_attestation_id', [arg]);

    return result.stack.readAddress();
  }

  async getAttestationOffchainId(provider: ContractProvider, attestationOffchain: AttestationOffchainConfig): Promise<Address> {
    const arg: TupleItem = {
      cell: attestationOffchainConfigToCell(attestationOffchain),
      type: 'cell',
    }
    const result = await provider.get('get_attestation_offchain_id', [arg]);

    return result.stack.readAddress();
  }

  async getSchemaId(provider: ContractProvider, schema: SchemaConfig): Promise<Address> {
    const arg: TupleItem = {
      cell: schemaConfigToCell(schema),
      type: 'cell',
    }
    const result = await provider.get('get_schema_id', [arg]);

    return result.stack.readAddress();
  }

  async sendChangeAdmin(provider: ContractProvider, via: Sender, newAdmin: Address) {
    const messageBody = beginCell()
      .storeUint(OpCode.ChangeAdmin, 32)
      .storeUint(0, 64)
      .storeAddress(newAdmin)
      .endCell();
    const result = await provider.internal(via, {
      value: '0.01',
      body: messageBody,
    });

    return result;
  }

  async sendChangeCode(provider: ContractProvider, via: Sender, codeType: CodeType, newCode: Cell) {
    const messageBody = beginCell()
      .storeUint(OpCode.ChangeCode, 32)
      .storeUint(0, 64)
      .storeUint(codeType, 32)
      .storeRef(newCode)
      .endCell();
    const result = await provider.internal(via, {
      value: '0.01',
      body: messageBody,
    });

    return result;
  }

  async sendChangePause(provider: ContractProvider, via: Sender, paused: boolean) {
    const messageBody = beginCell()
      .storeUint(OpCode.ChangePaused, 32)
      .storeUint(0, 64)
      .storeUint(Number(paused), 1)
      .endCell();
    const result = await provider.internal(via, {
      value: '0.01',
      body: messageBody,
    });

    return result;
  }

  async sendChangeVersion(provider: ContractProvider, via: Sender, version: string) {
    const messageBody = beginCell()
      .storeUint(OpCode.ChangeVersion, 32)
      .storeUint(0, 64)
      .storeUint(stringToInt(version), 64)
      .endCell();
    const result = await provider.internal(via, {
      value: '0.01',
      body: messageBody,
    });

    return result;
  }

  async sendWithdraw(provider: ContractProvider, via: Sender, amount: string) {
    const messageBody = beginCell()
      .storeUint(OpCode.Withdraw, 32)
      .storeUint(0, 64)
      .storeCoins(toNano(amount))
      .endCell();
    const result = await provider.internal(via, {
      value: '0.01',
      body: messageBody,
    });

    return result;
  }

  async sendRegisterSchema(provider: ContractProvider, via: Sender, schema: SchemaConfig, signature?: Uint8Array, hook?: Cell) {
    const schemaCell = schemaConfigToCell(schema);
    const messageBuilder = beginCell()
      .storeUint(OpCode.Register, 32)
      .storeUint(0, 64)
      .storeBuffer(signature ? Buffer.from(signature) : Buffer.alloc(64), 64)
      .storeRef(schemaCell)
      .storeUint(hook ? 1 : 0, 1);

    if (hook) {
      messageBuilder.storeRef(hook);
    }

    const result = await provider.internal(via, {
      value: '0.1',
      body: messageBuilder.endCell(),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });

    return result;
  }

  async sendAttest(
    provider: ContractProvider,
    via: Sender,
    attestation: AttestationConfig,
    schema: SchemaConfig,
    signature?: Uint8Array,
    fees?: bigint,
  ) {
    const schemaCell = schemaConfigToCell(schema);
    const attestCell = attestationConfigToCell(attestation);
    const messageBody = beginCell()
      .storeUint(OpCode.Attest, 32)
      .storeUint(0, 64)
      .storeBuffer(signature ? Buffer.from(signature) : Buffer.alloc(64), 64)
      .storeRef(attestCell)
      .storeRef(schemaCell);

    if (fees) {
      messageBody.storeCoins(fees);
    }

    const result = await provider.internal(via, {
      value: fees || '0.04',
      body: messageBody.endCell(),
    });

    return result;
  }

  async sendAttestOffchain(
    provider: ContractProvider,
    via: Sender,
    attester: Address,
    attestation: AttestationOffchainConfig,
    signature?: Uint8Array,
  ) {
    const attestCell = attestationOffchainConfigToCell(attestation);
    const messageBody = beginCell()
      .storeUint(OpCode.Attest, 32)
      .storeUint(0, 64)
      .storeBuffer(signature ? Buffer.from(signature) : Buffer.alloc(64), 64)
      .storeRef(attestCell)
      .storeRef(beginCell().storeAddress(attester).endCell())
      .endCell();

    const result = await provider.internal(via, {
      value: '0.04',
      body: messageBody,
    });

    return result;
  }

  async sendRevokeAttestation(
    provider: ContractProvider,
    via: Sender,
    attestationId: Address,
    attestation: AttestationConfig,
    schema: SchemaConfig,
    reason: string,
    signature?: Uint8Array,
    fees?: bigint,
  ) {
    const schemaCell = schemaConfigToCell(schema);
    const attestCell = attestationConfigToCell(attestation);
    const messageBody = beginCell()
      .storeUint(OpCode.Revoke, 32)
      .storeUint(0, 64)
      .storeBuffer(signature ? Buffer.from(signature) : Buffer.alloc(64), 64)
      .storeRef(beginCell().storeAddress(attestationId).storeUint(stringToInt(reason), 256).endCell())
      .storeRef(attestCell)
      .storeRef(schemaCell);

    if (fees) {
      messageBody.storeCoins(fees);
    }

    const result = await provider.internal(via, {
      value: fees || '0.04',
      body: messageBody.endCell(),
    });

    return result;
  }

  async sendRevokeAttestationOffchain(
    provider: ContractProvider,
    via: Sender,
    attestationId: Address,
    attestation: AttestationOffchainConfig,
    reason: string,
    signature?: Uint8Array,
  ) {
    const attestCell = attestationOffchainConfigToCell(attestation);
    const messageBody = beginCell()
      .storeUint(OpCode.Revoke, 32)
      .storeUint(0, 64)
      .storeBuffer(signature ? Buffer.from(signature) : Buffer.alloc(64), 64)
      .storeRef(beginCell().storeAddress(attestationId).storeUint(stringToInt(reason), 256).endCell())
      .storeRef(attestCell)
      .endCell();

    const result = await provider.internal(via, {
      value: '0.04',
      body: messageBody,
    });

    return result;
  }
}
