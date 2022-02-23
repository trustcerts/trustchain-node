import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainGateway } from './blockchain.gateway';

describe('BlockchainGateway', () => {
  let gateway: BlockchainGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainGateway],
    }).compile();

    gateway = module.get<BlockchainGateway>(BlockchainGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
