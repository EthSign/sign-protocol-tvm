import { Blockchain, SandboxContract, BlockchainContractProvider, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Address, Sender, ContractProvider } from '@ton/core';
import { SignProtocol } from '../wrappers/SignProtocol';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { Schema, SchemaConfig, schemaConfigToCell } from '../wrappers';
import { DataLocation, getRegisterHashCell, signCell } from '../utils';
import { KeyPair, mnemonicNew, mnemonicToWalletKey } from 'ton-crypto';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { SmartContract } from 'ton-contract-executor';

describe('SignProtocol', () => {
  let code: Cell, schemaCode: Cell, attestationCode: Cell, attestationOffchainCode: Cell;

  beforeAll(async () => {
    code = await compile('SignProtocol');
    schemaCode = await compile('Schema');
    attestationCode = await compile('Attestation');
    attestationOffchainCode = await compile('AttestationOffchain');
  });

  let blockchain: Blockchain;
  let users: WalletContractV4[];
  let mnemonics: string[][];
  let keys: KeyPair[] = [];
  let signProtocol: SandboxContract<SignProtocol>;
  let admin: SandboxContract<TreasuryContract>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    mnemonics = await Promise.all(Array.from({ length: 10 }, () => mnemonicNew()));
    admin = await blockchain.treasury('admin', {
      balance: toNano('1000'),
    });

    users = await Promise.all(
      mnemonics.map(async (mnemonic) => {
        const key = await mnemonicToWalletKey(mnemonic);
        keys.push(key);
        return WalletContractV4.create({
          publicKey: key.publicKey,
          workchain: 0,
        });
      }),
    );

    signProtocol = blockchain.openContract(
      SignProtocol.createFromConfig(
        {
          adminAddress: admin.address,
          version: '0.0.0',
          paused: false,
          schemaCounter: 0,
          attestationCounter: 0,
          attestationCode,
          attestationOffchainCode,
          schemaCode,
        },
        code,
      ),
    );

    const spContract = await blockchain.getContract(signProtocol.address);

    await signProtocol.sendDeploy(admin.getSender(), toNano('100'));

    expect(spContract.balance).toBeGreaterThan(toNano('0'));
    expect(spContract.accountState?.type).toBe('active');
  });

  it('should deploy', async () => {
    // the check is done inside beforeEach
    // blockchain and signProtocol are ready to use
  });

  it('should change version and paused', async () => {
    expect(await signProtocol.getVersion()).toEqual('0.0.0');
    expect((await signProtocol.getPaused())).toEqual(false);

    let tran = await signProtocol.sendChangeVersion(
      admin.getSender(),
      '1.0.0',
    );

    expect(tran.transactions).toHaveTransaction({
      from: admin.address,
      to: signProtocol.address,
      success: true,
    });

    expect(await signProtocol.getVersion()).toEqual('1.0.0');

    tran = await signProtocol.sendChangePause(
      admin.getSender(),
      true,
    );

    expect(tran.transactions).toHaveTransaction({
      from: admin.address,
      to: signProtocol.address,
      success: true,
    });

    expect((await signProtocol.getPaused())).toEqual(true);
  });

  it('should withdraw', async () => {
    const originalBalance = await admin.getBalance();
    const result = await signProtocol.sendWithdraw(
      admin.getSender(), '1');

    expect(result.transactions).toHaveTransaction({
      from: signProtocol.address,
      to: admin.address,
      success: true,
    });
    expect(await admin.getBalance()).toBeGreaterThan(originalBalance);
    expect(await admin.getBalance()).toBeLessThan(originalBalance + toNano('1'));
  });

  it('should register schema', async () => {
    const schemaCounter = await signProtocol.getSchemaCounter();
    const schema: SchemaConfig = {
      dataLen: 4,
      data: 'Test',
      dataLocation: DataLocation.ONCHAIN,
      maxValidFor: new Date('2025-01-01'),
      timestamp: new Date(),
      registrant: users[0].address,
      registrantPubKey: users[0].publicKey,
      revocable: true,
      schemaId: await signProtocol.getSchemaCounter(),
      attestationCode,
      spAddress: signProtocol.address,
    };
    const cellToSign = getRegisterHashCell(schema);
    const { signature } = await signCell(cellToSign, mnemonics[0].join(' '));

    const trans = await signProtocol.sendRegisterSchema(admin.getSender(), schema, signature);

    expect(trans.transactions).toHaveTransaction({
      from: admin.address,
      to: signProtocol.address,
      success: true,
    });

    const schemaAddress = await signProtocol.getSchemaAddress(schema.schemaId);
    const newSchemaCounter = await signProtocol.getSchemaCounter();

    expect(newSchemaCounter).toEqual(schemaCounter + 1);

    expect((await blockchain.getContract(schemaAddress)).accountState?.type).toBe('active');

    const schemaData = await blockchain.openContract(Schema.createFromAddress(schemaAddress)).getSchemaData();

    expect(schemaData.data).toEqual(schema.data);
  });
});
