import { Test, TestingModule } from '@nestjs/testing';
import { TemplateCachedService } from './template-cached.service';

describe('TemplateCachedService', () => {
  let service: TemplateCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateCachedService],
    }).compile();

    service = module.get<TemplateCachedService>(TemplateCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
