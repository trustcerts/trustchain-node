import { Test, TestingModule } from '@nestjs/testing';
import { ObserverStatusListController } from './observer-statuslist.controller';

describe('ObserverStatusListController', () => {
  let controller: ObserverStatusListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObserverStatusListController],
    }).compile();

    controller = module.get<ObserverStatusListController>(
      ObserverStatusListController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
