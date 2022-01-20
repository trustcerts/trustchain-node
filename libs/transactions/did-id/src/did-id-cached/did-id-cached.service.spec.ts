import { Test, TestingModule } from '@nestjs/testing';
import { DidIdCachedService } from './did-id-cached.service';

describe('DidCachedService', () => {
  let service: DidIdCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DidIdCachedService],
    }).compile();

    service = module.get<DidIdCachedService>(DidIdCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
