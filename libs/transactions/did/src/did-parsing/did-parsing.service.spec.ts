import { Test, TestingModule } from '@nestjs/testing';
import { DidParsingService } from './did-parsing.service';

describe('DidParsingService', () => {
  let service: DidParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DidParsingService],
    }).compile();

    service = module.get<DidParsingService>(DidParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
