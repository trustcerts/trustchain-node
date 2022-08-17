import { Test, TestingModule } from '@nestjs/testing';
import { StatusListParsingService } from './status-list-parsing.service';

describe('StatusListParsingService', () => {
  let service: StatusListParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusListParsingService],
    }).compile();

    service = module.get<StatusListParsingService>(StatusListParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
