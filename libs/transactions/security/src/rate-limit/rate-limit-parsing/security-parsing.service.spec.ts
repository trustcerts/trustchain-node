import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitParsingService } from './rate-limit-parsing.service';

describe('SecurityParsingService', () => {
  let service: RateLimitParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitParsingService],
    }).compile();

    service = module.get<RateLimitParsingService>(RateLimitParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
