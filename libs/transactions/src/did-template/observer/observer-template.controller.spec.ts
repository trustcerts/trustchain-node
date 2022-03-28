import { Test, TestingModule } from '@nestjs/testing';
import { ObserverTemplateController } from './observer-template.controller';

describe('ObserverTemplateController', () => {
  let controller: ObserverTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObserverTemplateController],
    }).compile();

    controller = module.get<ObserverTemplateController>(
      ObserverTemplateController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
