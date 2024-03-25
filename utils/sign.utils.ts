import { Cell } from '@ton/core';
import { KeyPair, mnemonicToWalletKey } from 'ton-crypto';
import nacl from 'tweetnacl';

export async function signCell(
  cell: Cell,
  walletMnemonic: string,
): Promise<{ signature: Uint8Array; keyPair: KeyPair }> {
  const keyPair = await mnemonicToWalletKey(walletMnemonic.split(' '));

  return {
    signature: nacl.sign.detached(cell.hash(), keyPair.secretKey),
    keyPair,
  };
}

export function verifySignature(signature: Uint8Array, signatureData: Cell, keyPair: KeyPair): boolean {
  return nacl.sign.detached.verify(signatureData.hash(), signature, keyPair.publicKey);
}
