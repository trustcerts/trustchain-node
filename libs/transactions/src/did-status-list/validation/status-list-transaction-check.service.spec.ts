import { Test, TestingModule } from '@nestjs/testing';
import { StatusListTransactionCheckService } from './status-list-transaction-check.service';

describe('StatusListTransactionCheckService', () => {
  let service: StatusListTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusListTransactionCheckService],
    }).compile();

    service = module.get<StatusListTransactionCheckService>(
      StatusListTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
