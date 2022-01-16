import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitCachedService } from './rate-limit-cached.service';

describe('RateLimitService', () => {
  let service: RateLimitCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitCachedService],
    }).compile();

    service = module.get<RateLimitCachedService>(RateLimitCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
