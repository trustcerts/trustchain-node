import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import {
  DidHash,
  HashSchema,
} from '@tc/transactions/did-hash/schemas/did-hash.schema';
import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { EventClientModule } from '@tc/clients/event-client';
import { HASH_CONNECTION } from '@tc/transactions/did-hash/constants';
import { HashCachedModule } from '@tc/transactions/did-hash/cached/hash-cached.module';
import { HashDbModule } from '@tc/transactions/did-hash/db/hash-db.module';
import { HashModule } from '@tc/blockchain';
import { HashTransactionCheckService } from './hash-transaction-check.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    HashModule,
    BlockCheckModule,
    HashCachedModule,
    DidIdCachedModule,
    EventClientModule,
    HashDbModule,
    MongooseModule.forFeature(
      [{ name: DidHash.name, schema: HashSchema }],
      HASH_CONNECTION,
    ),
  ],
  providers: [HashTransactionCheckService],
  exports: [HashTransactionCheckService, HashCachedModule],
})
export class HashBlockchainModule {}
