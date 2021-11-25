import { Test, TestingModule } from '@nestjs/testing';
import { ObserverHealthController } from './observer-health.controller';

describe('ObserverHealth Controller', () => {
  let controller: ObserverHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObserverHealthController],
    }).compile();

    controller = module.get<ObserverHealthController>(ObserverHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
