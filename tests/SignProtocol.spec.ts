import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, beginCell, Address } from '@ton/core';
import { SignProtocol } from '../wrappers/SignProtocol';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('SignProtocol', () => {
  let code: Cell;

  beforeAll(async () => {
    code = await compile('SignProtocol');
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
          attestationCode: beginCell().endCell(),
          schemaCode: beginCell().endCell(),
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
