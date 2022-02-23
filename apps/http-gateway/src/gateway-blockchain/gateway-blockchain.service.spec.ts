import { Test, TestingModule } from '@nestjs/testing';
import { GatewayBlockchainService } from './gateway-blockchain.service';

describe('GatewayBlockchainService', () => {
  let service: GatewayBlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayBlockchainService],
    }).compile();

    service = module.get<GatewayBlockchainService>(GatewayBlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
