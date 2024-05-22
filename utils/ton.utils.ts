import { Address, BitString, Cell, Slice, beginCell, contractAddress, crc32c, toNano } from '@ton/core';

export function stringToSlice(str: string): Slice {
  return beginCell().storeStringTail(str).endCell().asSlice();
}

export function sliceToString(slice: Slice): string {
  const cell = beginCell().storeSlice(slice).endCell();
  return cell.beginParse().loadStringTail();
}

export function stringToInt(str: string): number {
  return str ? parseInt(Buffer.from(str).toString('hex'), 16) : 0;
}

export function intToString(int: number): string {
  return Buffer.from(int.toString(16), 'hex').toString('utf-8');
}

export function bufferToInt(buf: Buffer): number {
  return buf.readUInt32BE(0);
}

export function intToBuffer(int: number): Buffer {
  return Buffer.from(int.toString(16), 'hex');
}

export function sliceToAddress(slice: Slice): Address {
  const cell = beginCell().storeSlice(slice).endCell();
  return cell.beginParse().loadAddress();
}

export function addressToSlice(address: Address): Slice {
  return beginCell().storeAddress(address).endCell().asSlice();
}

export function stringToBitString(str: string): BitString {
  return new BitString(Buffer.from(str), 0, str.length * 8);
}

export function bitStringToString(bits: BitString, len: number): string {
  const decoder = new TextDecoder();
  const subBuffer = bits.subbuffer(0, len);

  return subBuffer ? decoder.decode(subBuffer) : '';
}

export function stringToCell(str: string): Cell {
  return beginCell().storeStringTail(str).endCell();
}

export function cellToString(cell: Cell): string {
  return cell.beginParse().loadStringTail();
}

export function stringToCrc32(str: string): number {
  return crc32c(Buffer.from(str)).readUint32BE();
}

export function getContractAddress(code: Cell, data: Cell): Address {
  return contractAddress(0, { code, data });
}

export function arraysToCell(arrays: (Slice | Cell | Address | number)[], bits = 32): Cell {
  const cell = beginCell();

  arrays.forEach((item) => {
    if (item instanceof Slice) {
      cell.storeSlice(item);
    } else if (item instanceof Cell) {
      cell.storeRef(item);
    } else if (item instanceof Address) {
      cell.storeAddress(item);
    } else if (typeof item === 'number') {
      cell.storeUint(item, bits);
    }
  });

  return cell.endCell();
}

export function coinsToSlice(coins: string): Slice {
  return beginCell().storeCoins(toNano(coins)).endCell().asSlice();
}