import { Test, TestingModule } from '@nestjs/testing';
import { NetworkController } from './network.controller';

describe('Network Controller', () => {
  let controller: NetworkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NetworkController],
    }).compile();

    controller = module.get<NetworkController>(NetworkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
