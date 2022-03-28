import { Test, TestingModule } from '@nestjs/testing';
import { GatewaySchemaController } from './gateway-schema.controller';

describe('GatewaySchemaController', () => {
  let controller: GatewaySchemaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewaySchemaController],
    }).compile();

    controller = module.get<GatewaySchemaController>(GatewaySchemaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
