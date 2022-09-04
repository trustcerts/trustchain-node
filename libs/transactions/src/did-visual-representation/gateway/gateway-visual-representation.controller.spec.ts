import { Test, TestingModule } from '@nestjs/testing';
import { GatewayVisualRepresentationController } from './gateway-visualrepresentation.controller';

describe('GatewayVisualRepresentationController', () => {
  let controller: GatewayVisualRepresentationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayVisualRepresentationController],
    }).compile();

    controller = module.get<GatewayVisualRepresentationController>(
      GatewayVisualRepresentationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
