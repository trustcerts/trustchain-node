import { Test, TestingModule } from '@nestjs/testing';
import { DidIdParsingService } from './did-id-parsing.service';

describe('DidIdParsingService', () => {
  let service: DidIdParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DidIdParsingService],
    }).compile();

    service = module.get<DidIdParsingService>(DidIdParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
