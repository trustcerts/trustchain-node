import { EventClientModule } from '@tc/event-client';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { Hash, HashSchema } from '@tc/hash/schemas/hash.schema';
import { HashDbModule } from '@tc/hash/hash-db/hash-db.module';
import { HashModule } from '@tc/blockchain';
import { HashParsingService } from '@tc/hash/hash-parsing/hash-parsing.service';
import {
  HashTransaction,
  HashTransactionSchema,
} from '../schemas/hash-transaction.schema';
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
    MongooseModule.forFeature(
      [
        { name: Hash.name, schema: HashSchema },
        { name: HashTransaction.name, schema: HashTransactionSchema },
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
