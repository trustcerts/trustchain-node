import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { Module } from '@nestjs/common';
import { TemplateCachedModule } from '../template-cached/template-cached.module';
import { TemplateTransactionCheckService } from './template-transaction-check/template-transaction-check.service';

@Module({
  imports: [BlockCheckModule, TemplateCachedModule],
  providers: [TemplateTransactionCheckService],
  exports: [TemplateTransactionCheckService],
})
export class TemplateBlockchainModule {}
