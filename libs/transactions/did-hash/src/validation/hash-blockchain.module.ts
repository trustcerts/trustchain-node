import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { DidHash, HashSchema } from '@tc/did-hash/schemas/did-hash.schema';
import { DidIdCachedModule } from '@tc/did-id/cached/did-id-cached.module';
import { EventClientModule } from '@tc/event-client';
import { HASH_CONNECTION } from '@tc/did-hash/constants';
import { HashCachedModule } from '@tc/did-hash/cached/hash-cached.module';
import { HashDbModule } from '@tc/did-hash/db/hash-db.module';
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
