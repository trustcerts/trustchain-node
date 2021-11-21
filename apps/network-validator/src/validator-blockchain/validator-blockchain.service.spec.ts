import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorBlockchainService } from './validator-blockchain.service';

describe('ValidatorBlockchainService', () => {
  let service: ValidatorBlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatorBlockchainService],
    }).compile();

    service = module.get<ValidatorBlockchainService>(
      ValidatorBlockchainService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
