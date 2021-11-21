import { Test, TestingModule } from '@nestjs/testing';
import { GatewayDidController } from './gateway-did.controller';

describe('GatewayDid Controller', () => {
  let controller: GatewayDidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayDidController],
    }).compile();

    controller = module.get<GatewayDidController>(GatewayDidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
