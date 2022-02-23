import { Test, TestingModule } from '@nestjs/testing';
import { GenesisService } from './genesis.service';

describe('RootCertService', () => {
  let service: GenesisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenesisService],
    }).compile();

    service = module.get<GenesisService>(GenesisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
