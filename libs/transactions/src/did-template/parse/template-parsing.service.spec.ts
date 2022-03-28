import { Test, TestingModule } from '@nestjs/testing';
import { TemplateParsingService } from './template-parsing.service';

describe('TemplateParsingService', () => {
  let service: TemplateParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateParsingService],
    }).compile();

    service = module.get<TemplateParsingService>(TemplateParsingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
