import { Slice, beginCell } from '@ton/core';

export function stringToSlice(str: string): Slice {
  return beginCell().storeBuffer(Buffer.from(str, 'utf-8')).endCell().asSlice();
}
