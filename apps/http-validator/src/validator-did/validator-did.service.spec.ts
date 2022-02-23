import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorDidService } from './validator-did.service';

describe('ValidatorDidService', () => {
  let service: ValidatorDidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatorDidService],
    }).compile();

    service = module.get<ValidatorDidService>(ValidatorDidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
