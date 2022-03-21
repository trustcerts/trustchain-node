import { Test, TestingModule } from '@nestjs/testing';
import { TemplateTransactionCheckService } from './template-transaction-check.service';

describe('TemplateTransactionCheckService', () => {
  let service: TemplateTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateTransactionCheckService],
    }).compile();

    service = module.get<TemplateTransactionCheckService>(
      TemplateTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
