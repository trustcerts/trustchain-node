import { Test, TestingModule } from '@nestjs/testing';
import { ProposerService } from './proposer.service';

describe('ProposerService', () => {
  let service: ProposerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProposerService],
    }).compile();

    service = module.get<ProposerService>(ProposerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
