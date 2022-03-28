import { Test, TestingModule } from '@nestjs/testing';
import { WalletClientService } from './wallet-client.service';

describe('WalletClientService', () => {
  let service: WalletClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletClientService],
    }).compile();

    service = module.get<WalletClientService>(WalletClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
