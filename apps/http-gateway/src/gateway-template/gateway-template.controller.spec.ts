import { Test, TestingModule } from '@nestjs/testing';
import { GatewayTemplateController } from './gateway-template.controller';

describe('GatewayTemplateController', () => {
  let controller: GatewayTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayTemplateController],
    }).compile();

    controller = module.get<GatewayTemplateController>(
      GatewayTemplateController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
