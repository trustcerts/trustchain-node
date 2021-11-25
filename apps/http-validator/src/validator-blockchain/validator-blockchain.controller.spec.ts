import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorBlockchainController } from './validator-blockchain.controller';

describe('ValidatorBlockchain Controller', () => {
  let controller: ValidatorBlockchainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidatorBlockchainController],
    }).compile();

    controller = module.get<ValidatorBlockchainController>(ValidatorBlockchainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
