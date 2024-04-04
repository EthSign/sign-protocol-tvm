import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import {
  bufferToInt,
  DataLocation,
  dateToUnixTimestamp,
  intToBuffer,
  intToString,
  OpCode,
  stringToInt,
  unixTimestampToDate,
} from '../utils';
import { SchemaConfig, schemaConfigToCell } from './Schema';

export type AttestationConfig = {
  schemaId: Address;
  linkedAttestationId?: Address;
  attestTimestamp: Date;
  revokeTimestamp?: Date;
  attester: Address;
  attesterPubKey: Buffer;
  validUntil: Date;
  dataLocation: DataLocation;
  revoked?: boolean;
  recipients: Address[];
  data: string;
  schemaCounterId: number;
  linkedAttestationCounterId?: number;
  attestationCounterId: number;
};

export function attestationConfigToCell(config: AttestationConfig): Cell {
  const {
    schemaId,
    linkedAttestationId = null,
    attestTimestamp,
    revokeTimestamp = null,
    attester,
    attesterPubKey,
    validUntil,
    dataLocation,
    revoked,
    recipients,
    data,
    schemaCounterId,
    linkedAttestationCounterId = 0,
    attestationCounterId,
  } = config;

  const c3 = beginCell().storeUint(recipients.length, 64);

  recipients.map((recipient) => {
    c3.storeAddress(recipient);
  });

  const c2 = beginCell()
    .storeUint(stringToInt(data), 256)
    .storeUint(schemaCounterId, 64)
    .storeUint(linkedAttestationCounterId, 64)
    .storeUint(attestationCounterId, 64)
    .endCell();
  const initState = beginCell()
    .storeAddress(schemaId)
    .storeAddress(linkedAttestationId)
    .storeAddress(attester)
    .storeUint(dateToUnixTimestamp(attestTimestamp), 32)
    .storeUint(revokeTimestamp ? dateToUnixTimestamp(revokeTimestamp) : 0, 32)
    .storeUint(bufferToInt(attesterPubKey), 256)
    .storeUint(dateToUnixTimestamp(validUntil), 32)
    .storeUint(dataLocation, 2)
    .storeUint(Number(!!revoked), 1)
    .storeRef(c2)
    .storeRef(c3.endCell())
    .endCell();

  return initState;
}

export class Attestation implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new Attestation(address);
  }

  static createFromConfig(config: AttestationConfig, code: Cell, workchain = 0) {
    const data = attestationConfigToCell(config);
    const init = { code, data };
    return new Attestation(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getAttestationData(provider: ContractProvider): Promise<AttestationConfig> {
    const result = await provider.get('get_attestation_data', []);
    let cellHash = result.stack.readCell().beginParse();

    const schemaId = cellHash.loadAddress();
    const linkedAttestationId = cellHash.loadAddressAny() as Address;
    const attester = cellHash.loadAddress();
    const attestTimestamp = cellHash.loadUint(32);
    const revokeTimestamp = cellHash.loadUint(32);
    const attesterPubKey = intToBuffer(cellHash.loadUint(256));
    const validUntil = cellHash.loadUint(32);
    const dataLocation = cellHash.loadUint(2) as DataLocation;
    const revoked = cellHash.loadUint(1);

    const c2 = cellHash.loadRef().beginParse();
    const data = intToString(c2.loadUint(256));
    const schemaCounterId = c2.loadUint(64);
    const linkedAttestationCounterId = c2.loadUint(64);
    const attestationCounterId = c2.loadUint(64);

    const c3 = cellHash.loadRef().beginParse();
    const recipientsLen = c3.loadUint(64);
    const recipients: Address[] = [];

    Array.from({ length: recipientsLen }).forEach(() => {
      recipients.push(c3.loadAddress());
    });

    return {
      schemaId,
      linkedAttestationId,
      attestTimestamp: unixTimestampToDate(attestTimestamp),
      revokeTimestamp: unixTimestampToDate(revokeTimestamp),
      attester,
      attesterPubKey,
      validUntil: unixTimestampToDate(validUntil),
      dataLocation: dataLocation.toString() as unknown as DataLocation,
      revoked: !!revoked,
      data,
      schemaCounterId,
      linkedAttestationCounterId,
      attestationCounterId,
      recipients: recipients.map((recipient) => recipient),
    };
  }

  async sendRevokeAttestation(provider: ContractProvider, via: Sender, schema: SchemaConfig) {
    const schemaCell = schemaConfigToCell(schema);
    const messageBody = beginCell()
      .storeUint(0, 4)
      .storeUint(OpCode.RevokeAttestation, 32)
      .storeUint(0, 64)
      .storeAddress(via.address)
      .storeRef(schemaCell)
      .endCell();
    const result = await provider.internal(via, {
      value: '0.02',
      body: messageBody,
    });

    return result;
  }
}
