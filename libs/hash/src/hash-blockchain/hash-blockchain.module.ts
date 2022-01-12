import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { EventClientModule } from 'libs/clients/event-client/src';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { Hash, HashSchema } from '@tc/hash/entities/hash.entity';
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
    DidCachedModule,
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
