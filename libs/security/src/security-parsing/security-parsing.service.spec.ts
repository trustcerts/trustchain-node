import { Test, TestingModule } from '@nestjs/testing';
import { SecurityParsingService } from './security-parsing.service';

describe('SecurityParsingService', () => {
  let service: SecurityParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityParsingService],
    }).compile();

    service = module.get<SecurityParsingService>(SecurityParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
