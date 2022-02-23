import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorConsensusService } from './validator-consensus.service';

describe('ValidatorConsensusService', () => {
  let service: ValidatorConsensusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatorConsensusService],
    }).compile();

    service = module.get<ValidatorConsensusService>(ValidatorConsensusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
