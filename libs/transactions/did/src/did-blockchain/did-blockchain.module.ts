import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { DID_CONNECTION } from '@tc/did/constants';
import { Did, DidSchema } from '../schemas/did.schema';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { DidDbModule } from '@tc/did/did-db/did-db.module';
import {
  DidTransaction,
  DidTransactionSchema,
} from '@tc/did/schemas/did-transaction.schema';
import { DidTransactionCheckService } from '@tc/did/did-blockchain/did-transaction-check/did-transaction-check.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    BlockCheckModule,
    DidCachedModule,
    DidDbModule,
    MongooseModule.forFeature(
      [
        { name: DidTransaction.name, schema: DidTransactionSchema },
        { name: Did.name, schema: DidSchema },
      ],
      DID_CONNECTION,
    ),
  ],
  providers: [DidTransactionCheckService],
})
export class DidBlockchainModule {}
