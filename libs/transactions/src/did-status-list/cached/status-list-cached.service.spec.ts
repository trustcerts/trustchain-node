import { Test, TestingModule } from '@nestjs/testing';
import { StatusListCachedService } from './status-list-cached.service';

describe('StatusListCachedService', () => {
  let service: StatusListCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusListCachedService],
    }).compile();

    service = module.get<StatusListCachedService>(StatusListCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
