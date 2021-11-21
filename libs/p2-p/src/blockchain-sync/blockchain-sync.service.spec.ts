import { Test, TestingModule } from "@nestjs/testing";
import { BlockchainSyncService } from "./blockchain-sync.service";

describe("BlockchainSyncService", () => {
  let service: BlockchainSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainSyncService]
    }).compile();

    service = module.get<BlockchainSyncService>(BlockchainSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
