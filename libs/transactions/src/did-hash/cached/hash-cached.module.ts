import {
  DidHash,
  HashSchema,
} from '@tc/transactions/did-hash/schemas/did-hash.schema';
import {
  DidHashTransaction,
  HashTransactionSchema,
} from '../schemas/did-hash-transaction.schema';
import {
  DidId,
  DidIdSchema,
} from '@tc/transactions/did-id/schemas/did-id.schema';
import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { HASH_CONNECTION } from '@tc/transactions/did-hash/constants';
import { HashCachedService } from '@tc/transactions/did-hash/cached/hash-cached.service';
import { HashDbModule } from '@tc/transactions/did-hash/db/hash-db.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    DidIdCachedModule,
    HashDbModule,
    MongooseModule.forFeature(
      [
        { name: DidHash.name, schema: HashSchema },
        { name: DidHashTransaction.name, schema: HashTransactionSchema },
        { name: DidId.name, schema: DidIdSchema },
      ],
      HASH_CONNECTION,
    ),
  ],
  providers: [HashCachedService],
  exports: [HashCachedService],
})
export class HashCachedModule {}
