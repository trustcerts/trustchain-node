import { Test, TestingModule } from '@nestjs/testing';
import { HandshakeService } from './handshake.service';

describe('HandshakeService', () => {
  let service: HandshakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandshakeService],
    }).compile();

    service = module.get<HandshakeService>(HandshakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
