import { Test, TestingModule } from '@nestjs/testing';
import { HashParsingService } from './hash-parsing.service';

describe('HashBlockchainService', () => {
  let service: HashParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashParsingService],
    }).compile();

    service = module.get<HashParsingService>(HashParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
