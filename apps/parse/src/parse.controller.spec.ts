import { Test, TestingModule } from '@nestjs/testing';
import { ParseController } from './parse.controller';
import { ParseService } from './parse.service';

describe('ParseController', () => {
  let parseController: ParseController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ParseController],
      providers: [ParseService],
    }).compile();

    parseController = app.get<ParseController>(ParseController);
  });

  describe('root', () => {

  });
});
