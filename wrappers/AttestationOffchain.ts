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

export type AttestationOffchainConfig = {
  attester: Slice;
  timestamp: number;
};

export type AttestationOffchainData = {
  attester: string;
  timestamp: number;
};

export function attestationOffchainConfigToCell(config: AttestationOffchainConfig): Cell {
  const { attester, timestamp } = config;

  return beginCell().storeSlice(attester).storeUint(timestamp, 64).endCell();
}

export class AttestationOffchain implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new AttestationOffchain(address);
  }

  static createFromConfig(config: AttestationOffchainConfig, code: Cell, workchain = 0) {
    const data = attestationOffchainConfigToCell(config);
    const init = { code, data };
    return new AttestationOffchain(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getOffchainAttestationData(provider: ContractProvider): Promise<AttestationOffchainData> {
    const result = await provider.get('get_offchain_attestation_data', []);
    let cellHash = result.stack.readCell().beginParse();

    return {
      attester: cellHash.loadAddress().toString(),
      timestamp: cellHash.loadUint(64),
    };
  }
}
