import { Test, TestingModule } from '@nestjs/testing';
import { SchemaTransactionCheckService } from './schema-transaction-check.service';

describe('SchemaTransactionCheckService', () => {
  let service: SchemaTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaTransactionCheckService],
    }).compile();

    service = module.get<SchemaTransactionCheckService>(
      SchemaTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
