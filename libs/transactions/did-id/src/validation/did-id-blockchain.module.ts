import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { DID_ID_CONNECTION } from '../constants';
import { DidId, DidIdSchema } from '../schemas/did-id.schema';
import { DidIdCachedModule } from '../cached/did-id-cached.module';
import { DidIdDbModule } from '../db/did-id-db.module';
import {
  DidIdTransaction,
  DidTransactionSchema,
} from '../schemas/did-id-transaction.schema';
import { DidIdTransactionCheckService } from './did-id-transaction-check.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    BlockCheckModule,
    DidIdCachedModule,
    DidIdDbModule,
    MongooseModule.forFeature(
      [
        { name: DidIdTransaction.name, schema: DidTransactionSchema },
        { name: DidId.name, schema: DidIdSchema },
      ],
      DID_ID_CONNECTION,
    ),
  ],
  providers: [DidIdTransactionCheckService],
  exports: [DidIdTransactionCheckService],
})
export class DidIdBlockchainModule {}
