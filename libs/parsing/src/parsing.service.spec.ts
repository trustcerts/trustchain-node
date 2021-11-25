import { Test, TestingModule } from '@nestjs/testing';
import { ParsingService } from './parsing.service';

describe('ParsingService', () => {
  let service: ParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParsingService],
    }).compile();

    service = module.get<ParsingService>(ParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
