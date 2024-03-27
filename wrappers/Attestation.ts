import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import {
  bufferToInt,
  DataLocation,
  dateToUnixTimestamp,
  intToBuffer,
  intToString,
  stringToInt,
  stringToSlice,
  unixTimestampToDate,
} from '../utils';

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
    linkedAttestationId,
    attestTimestamp,
    revokeTimestamp,
    attester,
    attesterPubKey,
    validUntil,
    dataLocation,
    revoked,
    recipients,
    data,
    schemaCounterId,
    linkedAttestationCounterId,
    attestationCounterId,
  } = config;

  const c1 = beginCell()
    .storeUint(bufferToInt(attesterPubKey), 256)
    .storeUint(dateToUnixTimestamp(validUntil), 32)
    .storeUint(dataLocation, 2)
    .storeUint(Number(!!revoked), 1)
    .endCell();
  const c2 = beginCell().storeUint(recipients.length, 64);

  recipients.map((recipient) => {
    c2.storeAddress(recipient);
  });

  const c3 = beginCell()
    .storeUint(stringToInt(data), 256)
    .storeUint(schemaCounterId, 64)
    .storeMaybeUint(linkedAttestationCounterId, 64)
    .storeUint(attestationCounterId, 64)
    .endCell();
  const initState = beginCell()
    .storeAddress(schemaId)
    .storeAddress(linkedAttestationId)
    .storeAddress(attester)
    .storeUint(dateToUnixTimestamp(attestTimestamp), 32)
    .storeMaybeUint(revokeTimestamp ? dateToUnixTimestamp(revokeTimestamp) : 0, 32)
    .storeRef(c1)
    .storeRef(c2.endCell())
    .storeRef(c3)
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
    const linkedAttestationId = cellHash.loadAddress();
    const attester = cellHash.loadAddress();
    const attestTimestamp = cellHash.loadUint(32);
    const revokeTimestamp = cellHash.loadUint(32);

    const c1 = cellHash.loadRef().beginParse();
    const attesterPubKey = intToBuffer(c1.loadUint(256));
    const validUntil = c1.loadUint(32);
    const dataLocation = c1.loadUint(2) as DataLocation;
    const revoked = c1.loadUint(1);

    const c2 = cellHash.loadRef().beginParse();
    const recipientsLen = c2.loadUint(64);
    const recipients: Address[] = [];

    Array.from({ length: recipientsLen }).forEach(() => {
      recipients.push(c2.loadAddress());
    });

    const c3 = cellHash.loadRef().beginParse();
    const data = intToString(c3.loadUint(256));
    const schemaCounterId = c3.loadUint(64);
    const linkedAttestationCounterId = c3.loadUint(64);
    const attestationCounterId = c3.loadUint(64);

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
      recipients: recipients.map((recipient) => recipient),
      data,
      schemaCounterId,
      linkedAttestationCounterId,
      attestationCounterId,
    };
  }
}
