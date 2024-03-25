import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, beginCell } from '@ton/core';
import { SignProtocol } from '../wrappers/SignProtocol';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('SignProtocol', () => {
  let code: Cell, schemaCode: Cell, attestationCode: Cell, attestationOffchainCode: Cell;

  beforeAll(async () => {
    code = await compile('SignProtocol');
    schemaCode = await compile('Schema');
    attestationCode = await compile('Attestation');
    attestationOffchainCode = await compile('AttestationOffchain');
  });

  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let signProtocol: SandboxContract<SignProtocol>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();

    signProtocol = blockchain.openContract(
      SignProtocol.createFromConfig(
        {
          adminAddress: beginCell().endCell().asSlice(),
          version: 1,
          paused: false,
          schemaCounter: 0,
          attestationCounter: 0,
          initialSchemaCounter: 0,
          initialAttestationCounter: 0,
          attestationCode,
          attestationOffchainCode,
          schemaCode,
        },
        code,
      ),
    );

    deployer = await blockchain.treasury('deployer');

    const deployResult = await signProtocol.sendDeploy(deployer.getSender(), toNano('0.02'));

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: signProtocol.address,
      deploy: true,
      success: true,
    });
  });

  it('should deploy', async () => {
    // the check is done inside beforeEach
    // blockchain and signProtocol are ready to use
  });
});
