import { Test, TestingModule } from '@nestjs/testing';
import { HashRevocationTransactionCheckService } from './hash-revocation-transaction-check.service';

describe('HashRevocationTransactionCheckService', () => {
  let service: HashRevocationTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashRevocationTransactionCheckService],
    }).compile();

    service = module.get<HashRevocationTransactionCheckService>(
      HashRevocationTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
