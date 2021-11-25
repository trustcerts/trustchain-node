import { Test, TestingModule } from '@nestjs/testing';
import { GatewaySecurityService } from './gateway-security.service';

describe('GatewaySecurityService', () => {
  let service: GatewaySecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewaySecurityService],
    }).compile();

    service = module.get<GatewaySecurityService>(GatewaySecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
