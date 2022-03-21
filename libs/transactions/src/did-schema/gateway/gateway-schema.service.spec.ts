import { Test, TestingModule } from '@nestjs/testing';
import { GatewaySchemaService } from './gateway-schema.service';

describe('GatewaySchemaService', () => {
  let service: GatewaySchemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewaySchemaService],
    }).compile();

    service = module.get<GatewaySchemaService>(GatewaySchemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
