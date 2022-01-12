import { BlockchainSyncService } from './blockchain-sync.service';
import { Module } from '@nestjs/common';
import { NetworkModule } from '@tc/network';
import { PersistClientModule } from 'libs/clients/persist-client/src';

@Module({
  imports: [PersistClientModule, NetworkModule],
  providers: [BlockchainSyncService],
  exports: [BlockchainSyncService],
})
export class BlockchainSyncModule {}
