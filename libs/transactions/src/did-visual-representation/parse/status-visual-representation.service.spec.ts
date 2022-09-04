import { Test, TestingModule } from '@nestjs/testing';
import { VisualRepresentationParsingService } from './status-visual-representation.service';

describe('VisualRepresentationParsingService', () => {
  let service: VisualRepresentationParsingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisualRepresentationParsingService],
    }).compile();

    service = module.get<VisualRepresentationParsingService>(
      VisualRepresentationParsingService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
