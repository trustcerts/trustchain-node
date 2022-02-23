import { Test, TestingModule } from '@nestjs/testing';
import { ObserverDidController } from './observer-did.controller';

describe('ObserverDid Controller', () => {
  let controller: ObserverDidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObserverDidController],
    }).compile();

    controller = module.get<ObserverDidController>(ObserverDidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
