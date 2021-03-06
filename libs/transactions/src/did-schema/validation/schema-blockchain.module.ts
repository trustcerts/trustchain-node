import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { Module } from '@nestjs/common';
import { SchemaCachedModule } from '../cached/schema-cached.module';
import { SchemaTransactionCheckService } from './schema-transaction-check.service';

@Module({
  imports: [BlockCheckModule, SchemaCachedModule],
  providers: [SchemaTransactionCheckService],
  exports: [SchemaTransactionCheckService],
})
export class SchemaBlockchainModule {}
