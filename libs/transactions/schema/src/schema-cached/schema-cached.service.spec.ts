import { Test, TestingModule } from '@nestjs/testing';
import { SchemaCachedService } from './schema-cached.service';

describe('SchemaCachedService', () => {
  let service: SchemaCachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaCachedService],
    }).compile();

    service = module.get<SchemaCachedService>(SchemaCachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
