import { Test, TestingModule } from '@nestjs/testing';
import { GatewayStatusListController } from './gateway-statuslist.controller';

describe('GatewayStatusListController', () => {
  let controller: GatewayStatusListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayStatusListController],
    }).compile();

    controller = module.get<GatewayStatusListController>(
      GatewayStatusListController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
