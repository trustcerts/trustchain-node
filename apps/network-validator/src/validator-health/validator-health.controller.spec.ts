import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorHealthController } from './validator-health.controller';

describe('ValidatorHealth Controller', () => {
  let controller: ValidatorHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValidatorHealthController],
    }).compile();

    controller = module.get<ValidatorHealthController>(
      ValidatorHealthController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
