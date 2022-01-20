import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { EventClientModule } from '@tc/event-client';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { Hash, HashSchema } from '@tc/hash/schemas/hash.schema';
import { HashCachedModule } from '@tc/hash/hash-cached/hash-cached.module';
import { HashDbModule } from '@tc/hash/hash-db/hash-db.module';
import { HashModule } from '@tc/blockchain';
import { HashRevocationTransactionCheckService } from './hash-transaction-check/hash-revocation-transaction-check/hash-revocation-transaction-check.service';
import { HashSignTransactionCheckService } from './hash-transaction-check/hash-sign-transaction-check/hash-sign-transaction-check.service';
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
      [{ name: Hash.name, schema: HashSchema }],
      HASH_CONNECTION,
    ),
  ],
  providers: [
    HashSignTransactionCheckService,
    HashRevocationTransactionCheckService,
  ],
  exports: [
    HashSignTransactionCheckService,
    HashRevocationTransactionCheckService,
    HashCachedModule,
  ],
})
export class HashBlockchainModule {}
