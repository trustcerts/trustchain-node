import { Test, TestingModule } from '@nestjs/testing';
import { VisualRepresentationTransactionCheckService } from './visual-representation-transaction-check.service';

describe('VisualRepresentationTransactionCheckService', () => {
  let service: VisualRepresentationTransactionCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisualRepresentationTransactionCheckService],
    }).compile();

    service = module.get<VisualRepresentationTransactionCheckService>(
      VisualRepresentationTransactionCheckService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
