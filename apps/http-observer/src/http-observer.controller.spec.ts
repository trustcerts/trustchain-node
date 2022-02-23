import { Test, TestingModule } from '@nestjs/testing';
import { HttpObserverController } from './http-observer.controller';
import { HttpObserverService } from './http-observer.service';

describe('HttpObserverController', () => {
  let observerController: HttpObserverController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HttpObserverController],
      providers: [HttpObserverService],
    }).compile();

    observerController = app.get<HttpObserverController>(
      HttpObserverController,
    );
  });

  it('should be defined', () => {
    expect(observerController).toBeDefined();
  });
});
