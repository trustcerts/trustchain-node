import { Test, TestingModule } from '@nestjs/testing';
import { SecurityCachedService } from './security-cached.service';

describe('SecurityService', () => {
  let service: SecurityCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityCachedService],
    }).compile();

    service = module.get<SecurityCachedService>(SecurityCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
