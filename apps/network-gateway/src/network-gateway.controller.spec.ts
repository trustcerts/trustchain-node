import { Test, TestingModule } from '@nestjs/testing';
import { NetworkGatewayController } from './network-gateway.controller';
import { NetworkGatewayService } from './network-gateway.service';

describe('NetworkGatewayController', () => {
  let networkGatewayController: NetworkGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NetworkGatewayController],
      providers: [NetworkGatewayService],
    }).compile();

    networkGatewayController = app.get<NetworkGatewayController>(
      NetworkGatewayController,
    );
  });

  describe('root', () => {});
});
