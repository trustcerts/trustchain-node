import { DidHash, HashSchema } from '@tc/hash/schemas/did-hash.schema';
import {
  DidHashTransaction,
  HashTransactionSchema,
} from '../schemas/did-hash-transaction.schema';
import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashDbModule } from '@tc/hash/hash-db/hash-db.module';
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
      ],
      HASH_CONNECTION,
    ),
  ],
  providers: [HashCachedService],
  exports: [HashCachedService],
})
export class HashCachedModule {}
