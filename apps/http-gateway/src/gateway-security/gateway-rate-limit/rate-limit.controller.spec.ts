import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitController } from './rate-limit.controller';

describe('RateLimit Controller', () => {
  let controller: RateLimitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateLimitController],
    }).compile();

    controller = module.get<RateLimitController>(RateLimitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
