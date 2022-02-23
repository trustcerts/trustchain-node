import { Test, TestingModule } from '@nestjs/testing';
import { HttpGatewayService } from './http-gateway.service';

describe('HttpGatewayService', () => {
  let service: HttpGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpGatewayService],
    }).compile();

    service = module.get<HttpGatewayService>(HttpGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
