import { Test, TestingModule } from '@nestjs/testing';
import { ObserverHealthService } from './observer-health.service';

describe('ObserverHealthService', () => {
  let service: ObserverHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObserverHealthService],
    }).compile();

    service = module.get<ObserverHealthService>(ObserverHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
