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

export type AttestationConfig = {
  schemaId: Slice;
  linkedAttestationId: Slice;
  attestTimestamp: number;
  revokeTimestamp: number;
  attester: Slice;
  validUntil: number;
  dataLocation: Slice;
  revoked: number;
  recipientsLen: number;
  recipients: Slice;
  data: Slice;
  schemaCounterId: number;
  linkedAttestationCounterId: number;
  attestationCounterId: number;
  attestationCode: Cell;
};

export type AttestationData = {
  schemaId: string;
  linkedAttestationId: string;
  attestTimestamp: number;
  revokeTimestamp: number;
  attester: string;
  validUntil: number;
  dataLocation: string;
  revoked: boolean;
  recipientsLen: number;
  recipients: string[];
  data: string;
  schemaCounterId: number;
  linkedAttestationCounterId: number;
  attestationCounterId: number;
};

export function attestationConfigToCell(config: AttestationConfig): Cell {
  const {
    schemaId,
    linkedAttestationId,
    attestTimestamp,
    revokeTimestamp,
    attester,
    validUntil,
    dataLocation,
    revoked,
    recipientsLen,
    recipients,
    data,
    schemaCounterId,
    linkedAttestationCounterId,
    attestationCounterId,
    attestationCode,
  } = config;

  const initState = beginCell()
    .storeSlice(schemaId)
    .storeSlice(linkedAttestationId)
    .storeUint(attestTimestamp, 64)
    .storeUint(revokeTimestamp, 64)
    .storeSlice(attester)
    .storeUint(validUntil, 64)
    .storeSlice(dataLocation)
    .storeUint(revoked, 1)
    .storeUint(recipientsLen, 64);

  Array.from({ length: recipientsLen }).forEach(() => {
    initState.storeSlice(recipients);
  });

  return initState
    .storeSlice(data)
    .storeUint(schemaCounterId, 64)
    .storeUint(linkedAttestationCounterId, 64)
    .storeUint(attestationCounterId, 64)
    .storeRef(attestationCode)
    .endCell();
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

  async getAttestationData(provider: ContractProvider): Promise<AttestationData> {
    const result = await provider.get('get_attestation_data', []);
    let cellHash = result.stack.readCell().beginParse();

    const schemaId = cellHash.loadAddress();
    const linkedAttestationId = cellHash.loadAddress();
    const attestTimestamp = cellHash.loadUint(64);
    const revokeTimestamp = cellHash.loadUint(64);
    const attester = cellHash.loadAddress();
    const validUntil = cellHash.loadUint(64);
    const dataLocation = cellHash.loadStringRefTail();
    const revoked = cellHash.loadUint(1);
    const recipientsLen = cellHash.loadUint(64);
    const recipients: Address[] = [];

    Array.from({ length: recipientsLen }).forEach(() => {
      recipients.push(cellHash.loadAddress());
    });

    const data = cellHash.loadAddress();
    const schemaCounterId = cellHash.loadUint(64);
    const linkedAttestationCounterId = cellHash.loadUint(64);
    const attestationCounterId = cellHash.loadUint(64);

    return {
      schemaId: schemaId.toString(),
      linkedAttestationId: linkedAttestationId.toString(),
      attestTimestamp,
      revokeTimestamp,
      attester: attester.toString(),
      validUntil,
      dataLocation: dataLocation.toString(),
      revoked: !!revoked,
      recipientsLen,
      recipients: recipients.map((recipient) => recipient.toString()),
      data: data.toString(),
      schemaCounterId,
      linkedAttestationCounterId,
      attestationCounterId,
    };
  }
}
