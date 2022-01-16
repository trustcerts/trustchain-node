import { Test, TestingModule } from '@nestjs/testing';
import { DidTransactionCheckService } from './did-transaction-check.service';

describe('DidTransactionCheckService', () => {
  let service: DidTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DidTransactionCheckService],
    }).compile();

    service = module.get<DidTransactionCheckService>(DidTransactionCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
