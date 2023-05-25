import { Test, TestingModule } from '@nestjs/testing';
import { ObserverVisualRepresentationController } from './observer-visualrepresentation.controller';

describe('ObserverVisualRepresentationController', () => {
  let controller: ObserverVisualRepresentationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObserverVisualRepresentationController],
    }).compile();

    controller = module.get<ObserverVisualRepresentationController>(
      ObserverVisualRepresentationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
