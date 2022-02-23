import { Test, TestingModule } from '@nestjs/testing';
import { BlockReceivedController } from './block-received.controller';

describe('BlockReceivedController', () => {
  let controller: BlockReceivedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockReceivedController],
    }).compile();

    controller = module.get<BlockReceivedController>(BlockReceivedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
