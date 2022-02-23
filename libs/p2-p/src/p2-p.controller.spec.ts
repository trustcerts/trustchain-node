import { Test, TestingModule } from '@nestjs/testing';
import { P2PController } from './p2-p.controller';

describe('P2P Controller', () => {
  let controller: P2PController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [P2PController],
    }).compile();

    controller = module.get<P2PController>(P2PController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
