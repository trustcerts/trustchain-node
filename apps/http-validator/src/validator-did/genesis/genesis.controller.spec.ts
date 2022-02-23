import { Test, TestingModule } from '@nestjs/testing';
import { GenesisController } from './genesis.controller';

describe('RootCert Controller', () => {
  let controller: GenesisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenesisController],
    }).compile();

    controller = module.get<GenesisController>(GenesisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
