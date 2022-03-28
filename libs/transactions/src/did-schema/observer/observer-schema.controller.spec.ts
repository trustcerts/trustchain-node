import { Test, TestingModule } from '@nestjs/testing';
import { ObserverSchemaController } from './observer-schema.controller';

describe('ObserverSchemaController', () => {
  let controller: ObserverSchemaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObserverSchemaController],
    }).compile();

    controller = module.get<ObserverSchemaController>(ObserverSchemaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
