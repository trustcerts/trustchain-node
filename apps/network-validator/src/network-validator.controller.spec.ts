import { Test, TestingModule } from '@nestjs/testing';
import { NetworkValidatorController } from './network-validator.controller';
import { NetworkValidatorService } from './network-validator.service';

describe('AppController', () => {
  let networkValidatorController: NetworkValidatorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NetworkValidatorController],
      providers: [NetworkValidatorService],
    }).compile();

    networkValidatorController = app.get<NetworkValidatorController>(NetworkValidatorController);
  });

  describe('root', () => {
  });
});
