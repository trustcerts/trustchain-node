import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorHealthService } from './validator-health.service';

describe('ValidatorHealthService', () => {
  let service: ValidatorHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatorHealthService],
    }).compile();

    service = module.get<ValidatorHealthService>(ValidatorHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
