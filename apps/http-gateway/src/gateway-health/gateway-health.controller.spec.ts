import { Test, TestingModule } from '@nestjs/testing';
import { GatewayHealthController } from './gateway-health.controller';

describe('GatewayHealth Controller', () => {
  let controller: GatewayHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayHealthController],
    }).compile();

    controller = module.get<GatewayHealthController>(GatewayHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
