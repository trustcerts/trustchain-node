import { Test, TestingModule } from '@nestjs/testing';
import { PersistClientService } from './persist-client.service';

describe('PersistClientService', () => {
  let service: PersistClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersistClientService],
    }).compile();

    service = module.get<PersistClientService>(PersistClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
