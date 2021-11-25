import { Test, TestingModule } from '@nestjs/testing';
import { GatewayHealthService } from './gateway-health.service';

describe('GatewayHealthService', () => {
  let service: GatewayHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayHealthService],
    }).compile();

    service = module.get<GatewayHealthService>(GatewayHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
