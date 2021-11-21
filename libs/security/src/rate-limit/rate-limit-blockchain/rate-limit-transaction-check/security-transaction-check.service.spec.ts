import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitTransactionCheckService } from './rate-limit-transaction-check.service';

describe('SecurityTransactionCheckService', () => {
  let service: RateLimitTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitTransactionCheckService],
    }).compile();

    service = module.get<RateLimitTransactionCheckService>(
      RateLimitTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
