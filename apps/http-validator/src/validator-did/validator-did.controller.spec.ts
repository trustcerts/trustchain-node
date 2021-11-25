import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorDidController } from './validator-did.controller';

describe('ValidatorDid Controller', () => {
  let controller: ValidatorDidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidatorDidController],
    }).compile();

    controller = module.get<ValidatorDidController>(ValidatorDidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
