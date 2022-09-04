import { Test, TestingModule } from '@nestjs/testing';
import { GatewayVisualRepresentationService } from './gateway-visualrepresentation.service';

describe('GatewayVisualRepresentationService', () => {
  let service: GatewayVisualRepresentationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayVisualRepresentationService],
    }).compile();

    service = module.get<GatewayVisualRepresentationService>(
      GatewayVisualRepresentationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
