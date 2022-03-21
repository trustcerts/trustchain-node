import { Test, TestingModule } from '@nestjs/testing';
import { ObserverSchemaService } from './observer-schema.service';

describe('ObserverSchemaService', () => {
  let service: ObserverSchemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObserverSchemaService],
    }).compile();

    service = module.get<ObserverSchemaService>(ObserverSchemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
