import { Test, TestingModule } from '@nestjs/testing';
import { HttpValidatorService } from './http-validator.service';

describe('HttpValidatorService', () => {
  let service: HttpValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpValidatorService],
    }).compile();

    service = module.get<HttpValidatorService>(HttpValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
