import { Test, TestingModule } from '@nestjs/testing';
import { ParseClientService } from './parse-client.service';

describe('ParseClientService', () => {
  let service: ParseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParseClientService],
    }).compile();

    service = module.get<ParseClientService>(ParseClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
