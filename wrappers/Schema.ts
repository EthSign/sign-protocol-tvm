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

export type SchemaConfig = {
  registrant: Slice;
  revocable: number;
  dataLocation: Slice;
  maxValidFor: number;
  timestamp: number;
  data: Slice;
  schemaCounterId: number;
  spMasterAddress: Slice;
  schemaCode: Cell;
};

export type SchemaData = {
  registrant: string;
  revocable: boolean;
  dataLocation: string;
  maxValidFor: number;
  timestamp: number;
  data: string;
  schemaCounterId: number;
  spMasterAddress: string;
};

export function schemaConfigToCell(config: SchemaConfig): Cell {
  const { registrant, revocable, dataLocation, maxValidFor, timestamp, data, schemaCounterId, spMasterAddress } =
    config;

  return beginCell()
    .storeSlice(registrant)
    .storeUint(revocable, 1)
    .storeSlice(dataLocation)
    .storeUint(maxValidFor, 64)
    .storeUint(timestamp, 64)
    .storeSlice(data)
    .storeUint(schemaCounterId, 64)
    .storeSlice(spMasterAddress)
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

  async getSchemaData(provider: ContractProvider): Promise<SchemaData> {
    const result = await provider.get('get_schema_data', []);
    let cellHash = result.stack.readCell().beginParse();

    return {
      registrant: cellHash.loadAddress().toString(),
      revocable: !!cellHash.loadUint(1),
      dataLocation: cellHash.loadAddress().toString(),
      maxValidFor: cellHash.loadUint(64),
      timestamp: cellHash.loadUint(64),
      data: cellHash.loadAddress().toString(),
      schemaCounterId: cellHash.loadUint(64),
      spMasterAddress: cellHash.loadAddress().toString(),
    };
  }
}
