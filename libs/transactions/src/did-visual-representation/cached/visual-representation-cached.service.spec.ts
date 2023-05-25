import { Test, TestingModule } from '@nestjs/testing';
import { VisualRepresentationCachedService } from './visual-representation-cached.service';

describe('VisualRepresentationCachedService', () => {
  let service: VisualRepresentationCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisualRepresentationCachedService],
    }).compile();

    service = module.get<VisualRepresentationCachedService>(
      VisualRepresentationCachedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
