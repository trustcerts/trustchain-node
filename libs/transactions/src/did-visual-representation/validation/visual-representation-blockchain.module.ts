import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { Module } from '@nestjs/common';
import { VisualRepresentationCachedModule } from '../cached/visual-representation-cached.module';
import { VisualRepresentationTransactionCheckService } from './visual-representation-transaction-check.service';

@Module({
  imports: [BlockCheckModule, VisualRepresentationCachedModule],
  providers: [VisualRepresentationTransactionCheckService],
  exports: [VisualRepresentationTransactionCheckService],
})
export class VisualRepresentationBlockchainModule {}
