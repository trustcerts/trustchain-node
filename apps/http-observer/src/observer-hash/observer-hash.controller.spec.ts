import { Test, TestingModule } from '@nestjs/testing';
import { ObserverHashController } from './observer-hash.controller';

describe('ObserverHash Controller', () => {
  let controller: ObserverHashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObserverHashController],
    }).compile();

    controller = module.get<ObserverHashController>(ObserverHashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
