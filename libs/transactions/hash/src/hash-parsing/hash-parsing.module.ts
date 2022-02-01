import { DidHash, HashSchema } from '@tc/hash/schemas/did-hash.schema';
import {
  DidHashTransaction,
  HashTransactionSchema,
} from '../schemas/did-hash-transaction.schema';
import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { EventClientModule } from '@tc/event-client';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { HashDbModule } from '@tc/hash/hash-db/hash-db.module';
import { HashModule } from '@tc/blockchain';
import { HashParsingService } from '@tc/hash/hash-parsing/hash-parsing.service';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashDbModule,
    HashModule,
    DidIdCachedModule,
    MongooseModule.forFeature(
      [
        { name: DidHash.name, schema: HashSchema },
        { name: DidHashTransaction.name, schema: HashTransactionSchema },
      ],
      HASH_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    HashParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
})
export class HashParsingModule {}
