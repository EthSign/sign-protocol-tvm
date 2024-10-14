import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  parseTuple,
  Sender,
  SendMode,
  serializeTuple,
  Tuple,
} from '@ton/core';
import {
  bufferToInt,
  DataLocation,
  dateToUnixTimestamp,
  intToBuffer,
  intToString,
  OpCode,
  unixTimestampToDate,
} from '../utils';
import { SchemaConfig, schemaConfigToCell } from './Schema';

export type AttestationConfig = {
  schemaAddress: Address;
  linkedAttestationAddress?: Address;
  attestTimestamp: Date;
  revokeTimestamp?: Date;
  attester: Address;
  attesterPubKey: Buffer;
  validUntil: Date;
  dataLocation: DataLocation;
  revoked?: boolean;
  revocable: boolean;
  recipients: string[];
  dataLen: number;
  data: string;
  reasonLen?: number;
  reason?: string;
  spAddress: Address;
  schemaId: number;
  linkedAttestationId?: number;
  attestationId: number;
};

export function attestationConfigToCell(config: AttestationConfig): Cell {
  const {
    schemaAddress,
    linkedAttestationAddress = null,
    attestTimestamp,
    revokeTimestamp = null,
    attester,
    attesterPubKey,
    validUntil,
    dataLocation,
    revoked,
    recipients,
    dataLen,
    data,
    schemaId,
    linkedAttestationId = 0,
    attestationId,
    revocable,
    spAddress,
    reasonLen = 0,
    reason = '',
  } = config;

  let c3 = beginCell().storeUint(recipients.length, 64);
  let t: Tuple = {
    items: [],
    type: 'tuple',
  }

  recipients.forEach((recipient) => {
    t = {
      items: [{
        type: 'cell',
        cell:
          beginCell()
            .storeUint(recipient.length, 8)
            .storeStringTail(recipient)
            .endCell(),
      },
        t,
      ],
      type: 'tuple',
    }
  });

  c3 = c3.storeRef(serializeTuple(t.items));

  const c2 = beginCell()
    .storeUint(dataLen, 8)
    .storeStringTail(data)
    .storeUint(schemaId, 64)
    .storeUint(linkedAttestationId, 64)
    .storeUint(attestationId, 64)
    .storeAddress(spAddress)
    .storeUint(Number(revocable), 1)
    .storeUint(reasonLen, 8)
    .storeStringTail(reason)
    .endCell();
  const initState = beginCell()
    .storeAddress(schemaAddress)
    .storeAddress(linkedAttestationAddress)
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
  ) { }

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

    const schemaAddress = cellHash.loadAddress();
    const linkedAttestationAddress = cellHash.loadAddressAny() as Address;
    const attester = cellHash.loadAddress();
    const attestTimestamp = cellHash.loadUint(32);
    const revokeTimestamp = cellHash.loadUint(32);
    const attesterPubKey = intToBuffer(cellHash.loadUint(256));
    const validUntil = cellHash.loadUint(32);
    const dataLocation = cellHash.loadUint(2) as DataLocation;
    const revoked = cellHash.loadUint(1);

    const c2 = cellHash.loadRef().beginParse();
    const data = intToString(c2.loadUint(256));
    const schemaId = c2.loadUint(64);
    const linkedAttestationId = c2.loadUint(64);
    const attestationId = c2.loadUint(64);
    const spAddress = c2.loadAddress();
    const revocable = !!c2.loadUint(1);
    const reason = c2.loadStringTail();

    const c3 = cellHash.loadRef().beginParse();
    const recipientsLen = c3.loadUint(64);
    const recipients: string[] = [];

    Array.from({ length: recipientsLen }).forEach(() => {
      const t = parseTuple(c3.loadRef());
      const item = t.pop();
      const builder = item?.type === 'cell' ? item.cell.beginParse() : beginCell().endCell().beginParse();
      builder.loadUint(8);

      recipients.push(
        builder.loadStringTail(),
      );
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
      dataLen: data.length,
      data,
      schemaAddress,
      linkedAttestationAddress,
      attestationId,
      recipients: recipients.map((recipient) => recipient),
      revocable,
      reasonLen: reason.length,
      reason,
      spAddress,
    };
  }

  async sendRevokeAttestation(provider: ContractProvider, via: Sender, schema: SchemaConfig) {
    const schemaCell = schemaConfigToCell(schema);
    const messageBody = beginCell()
      .storeUint(OpCode.RevokeAttestation, 32)
      .storeUint(0, 64)
      .storeRef(schemaCell)
      .endCell();
    const result = await provider.internal(via, {
      value: '0.02',
      body: messageBody,
    });

    return result;
  }
}
