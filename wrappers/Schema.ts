import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import {
  bufferToInt,
  DataLocation,
  dateToUnixTimestamp,
  intToBuffer,
  unixTimestampToDate,
} from '../utils';

export type SchemaConfig = {
  registrant: Address;
  registrantPubKey: Buffer;
  revocable: boolean;
  dataLocation: DataLocation;
  maxValidFor: Date;
  timestamp: Date;
  dataLen: number;
  data: string;
  schemaId: number;
  spAddress: Address;
  attestationCode: Cell;
};

export function schemaConfigToCell(config: SchemaConfig): Cell {
  const { registrant, registrantPubKey, revocable, dataLocation, maxValidFor, timestamp, dataLen, data, schemaId, attestationCode, spAddress } =
    config;
  const c1 = beginCell()
    .storeUint(dataLen, 8)
    .storeStringTail(data)
    .endCell();
  const c2 = beginCell()
    .storeAddress(spAddress)
    .storeRef(attestationCode)
    .endCell();

  return beginCell()
    .storeAddress(registrant)
    .storeUint(bufferToInt(registrantPubKey), 256)
    .storeUint(Number(revocable), 1)
    .storeUint(dataLocation, 2)
    .storeUint(dateToUnixTimestamp(maxValidFor), 32)
    .storeUint(dateToUnixTimestamp(timestamp), 32)
    .storeUint(schemaId, 64)
    .storeRef(c1)
    .storeRef(c2)
    .endCell();
}

export class Schema implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) { }

  static createFromAddress(address: Address) {
    return new Schema(address);
  }

  static createFromConfig(config: SchemaConfig, code: Cell, workchain = 0) {
    const data = schemaConfigToCell(config);
    const init = { code, data };
    return new Schema(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getSchemaData(provider: ContractProvider): Promise<SchemaConfig> {
    const result = await provider.get('get_schema_data', []);
    let cellHash = result.stack.readCell().beginParse();

    const registrant = cellHash.loadAddress();
    const registrantPubKey = intToBuffer(cellHash.loadUint(256));
    const revocable = !!cellHash.loadUint(1);
    const dataLocation = cellHash.loadUint(2) as DataLocation;
    const maxValidFor = unixTimestampToDate(cellHash.loadUint(32));
    const timestamp = unixTimestampToDate(cellHash.loadUint(32));
    const schemaId = cellHash.loadUint(64);

    const s1 = cellHash.loadRef().beginParse();
    const dataLen = s1.loadUint(8);
    const data = s1.loadStringTail();

    const s2 = cellHash.loadRef().beginParse();
    const spAddress = s2.loadAddress();
    const attestationCode = s2.loadRef();

    return {
      spAddress,
      attestationCode,
      registrant,
      registrantPubKey,
      revocable,
      dataLocation,
      maxValidFor,
      timestamp,
      dataLen,
      data,
      schemaId,
    };
  }
}
