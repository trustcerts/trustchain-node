import { Test, TestingModule } from '@nestjs/testing';
import { DidCachedService } from './did-cached.service';

describe('DidCachedService', () => {
  let service: DidCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DidCachedService],
    }).compile();

    service = module.get<DidCachedService>(DidCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
