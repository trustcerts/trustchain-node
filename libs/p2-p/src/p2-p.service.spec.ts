import { Test, TestingModule } from '@nestjs/testing';
import { P2PService } from '@tc/p2-p/p2-p.service';

describe('P2PService', () => {
  let service: P2PService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [P2PService],
    }).compile();

    service = module.get<P2PService>(P2PService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
