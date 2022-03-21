import { Test, TestingModule } from '@nestjs/testing';
import { HashCachedService } from './hash-cached.service';

describe('HashService', () => {
  let service: HashCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashCachedService],
    }).compile();

    service = module.get<HashCachedService>(HashCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
