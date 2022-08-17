import { Test, TestingModule } from '@nestjs/testing';
import { GatewayStatusListService } from './gateway-statuslist.service';

describe('GatewayStatusListService', () => {
  let service: GatewayStatusListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayStatusListService],
    }).compile();

    service = module.get<GatewayStatusListService>(GatewayStatusListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
