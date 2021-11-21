import { Test, TestingModule } from '@nestjs/testing';
import { PersistController } from './persist.controller';
import { PersistService } from './persist.service';

describe('PersistController', () => {
  let persistController: PersistController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PersistController],
      providers: [PersistService],
    }).compile();

    persistController = app.get<PersistController>(PersistController);
  });

  describe('root', () => {
  });
});
