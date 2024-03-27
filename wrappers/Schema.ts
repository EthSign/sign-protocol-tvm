import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import {
  bufferToInt,
  DataLocation,
  dateToUnixTimestamp,
  intToBuffer,
  intToString,
  stringToInt,
  unixTimestampToDate,
} from '../utils';

export type SchemaConfig = {
  registrant: Address;
  registrantPubKey: Buffer;
  revocable: boolean;
  dataLocation: DataLocation;
  maxValidFor: Date;
  timestamp: Date;
  data: string;
  schemaCounterId: number;
};

export function schemaConfigToCell(config: SchemaConfig): Cell {
  const { registrant, registrantPubKey, revocable, dataLocation, maxValidFor, timestamp, data, schemaCounterId } =
    config;
  const c1 = beginCell().storeUint(stringToInt(data), 256).endCell();
  return beginCell()
    .storeAddress(registrant)
    .storeUint(bufferToInt(registrantPubKey), 256)
    .storeUint(Number(revocable), 1)
    .storeUint(dataLocation, 2)
    .storeUint(dateToUnixTimestamp(maxValidFor), 32)
    .storeUint(dateToUnixTimestamp(timestamp), 32)
    .storeUint(schemaCounterId, 64)
    .storeRef(c1)
    .endCell();
}

export class Schema implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

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
    const schemaCounterId = cellHash.loadUint(64);

    const s1 = cellHash.loadRef().beginParse();
    const data = intToString(s1.loadUint(256));

    return {
      registrant,
      registrantPubKey,
      revocable,
      dataLocation,
      maxValidFor,
      timestamp,
      data,
      schemaCounterId,
    };
  }
}
