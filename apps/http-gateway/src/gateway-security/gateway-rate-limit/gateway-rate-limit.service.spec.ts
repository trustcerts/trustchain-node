import { Test, TestingModule } from '@nestjs/testing';
import { GatewayRateLimitService } from './gateway-rate-limit.service';

describe('GatewayRateLimitService', () => {
  let service: GatewayRateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayRateLimitService],
    }).compile();

    service = module.get<GatewayRateLimitService>(GatewayRateLimitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
