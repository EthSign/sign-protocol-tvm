import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { bufferToInt, dateToUnixTimestamp, intToBuffer, unixTimestampToDate } from '../utils';

export type AttestationOffchainConfig = {
  attester: Address;
  attesterPubKey: Buffer;
  timestamp?: Date;
  reasonLen?: number;
  reason?: string;
  spAddress: Address;
};

export function attestationOffchainConfigToCell(config: AttestationOffchainConfig): Cell {
  const { attester, attesterPubKey, timestamp, spAddress, reasonLen = 0, reason = '' } = config;

  return beginCell()
    .storeAddress(attester)
    .storeUint(bufferToInt(attesterPubKey), 256)
    .storeUint(timestamp ? dateToUnixTimestamp(timestamp) : 0, 32)
    .storeUint(reasonLen, 8)
    .storeStringTail(reason)
    .storeAddress(spAddress)
    .endCell();
}

export class AttestationOffchain implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) { }

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

  async getOffchainAttestationData(provider: ContractProvider): Promise<AttestationOffchainConfig> {
    const result = await provider.get('get_offchain_attestation_data', []);
    let cellHash = result.stack.readCell().beginParse();

    return {
      attester: cellHash.loadAddress(),
      attesterPubKey: intToBuffer(cellHash.loadUint(256)),
      timestamp: unixTimestampToDate(cellHash.loadUint(32)),
      reasonLen: cellHash.loadUint(8),
      reason: cellHash.loadStringTail(),
      spAddress: cellHash.loadAddress(),
    };
  }
}
