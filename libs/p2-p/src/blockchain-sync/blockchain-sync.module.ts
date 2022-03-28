import { BlockReceivedModule } from '../block-received/block-received.module';
import { BlockchainSyncService } from './blockchain-sync.service';
import { Module } from '@nestjs/common';
import { PersistClientModule } from '@tc/clients/persist-client';

@Module({
  imports: [PersistClientModule, BlockReceivedModule],
  providers: [BlockchainSyncService],
  exports: [BlockchainSyncService],
})
export class BlockchainSyncModule {}
