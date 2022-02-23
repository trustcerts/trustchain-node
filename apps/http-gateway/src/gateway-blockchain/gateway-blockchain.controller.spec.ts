import { Test, TestingModule } from '@nestjs/testing';
import { GatewayBlockchainController } from './gateway-blockchain.controller';

describe('GatewayBlockchain Controller', () => {
  let controller: GatewayBlockchainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayBlockchainController],
    }).compile();

    controller = module.get<GatewayBlockchainController>(
      GatewayBlockchainController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
