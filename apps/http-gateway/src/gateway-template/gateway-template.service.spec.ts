import { Test, TestingModule } from '@nestjs/testing';
import { GatewayTemplateService } from './gateway-template.service';

describe('GatewayTemplateService', () => {
  let service: GatewayTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayTemplateService],
    }).compile();

    service = module.get<GatewayTemplateService>(GatewayTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
