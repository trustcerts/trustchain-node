import { Test, TestingModule } from '@nestjs/testing';
import { HashSignTransactionCheckService } from './hash-sign-transaction-check.service';

describe('HashCreationTransactionCheckService', () => {
  let service: HashSignTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashSignTransactionCheckService],
    }).compile();

    service = module.get<HashSignTransactionCheckService>(
      HashSignTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
