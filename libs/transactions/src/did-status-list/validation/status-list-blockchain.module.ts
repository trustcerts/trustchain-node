import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { Module } from '@nestjs/common';
import { StatusListCachedModule } from '../cached/status-list-cached.module';
import { StatusListTransactionCheckService } from './status-list-transaction-check.service';

@Module({
  imports: [BlockCheckModule, StatusListCachedModule],
  providers: [StatusListTransactionCheckService],
  exports: [StatusListTransactionCheckService],
})
export class StatusListBlockchainModule {}
