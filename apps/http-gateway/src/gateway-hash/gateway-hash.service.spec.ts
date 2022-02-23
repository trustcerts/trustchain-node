import { Test, TestingModule } from '@nestjs/testing';
import { GatewayHashService } from './gateway-hash.service';

describe('GatewayHashService', () => {
  let service: GatewayHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayHashService],
    }).compile();

    service = module.get<GatewayHashService>(GatewayHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
