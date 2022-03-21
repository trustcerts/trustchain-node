import { Test, TestingModule } from '@nestjs/testing';
import { DidIdTransactionCheckService } from './did-id-transaction-check.service';

describe('DidTransactionCheckService', () => {
  let service: DidIdTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DidIdTransactionCheckService],
    }).compile();

    service = module.get<DidIdTransactionCheckService>(
      DidIdTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
