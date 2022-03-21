import { Test, TestingModule } from '@nestjs/testing';
import { SchemaParsingService } from './schema-parsing.service';

describe('SchemaParsingService', () => {
  let service: SchemaParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaParsingService],
    }).compile();

    service = module.get<SchemaParsingService>(SchemaParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
