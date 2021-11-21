import { EventClientModule } from '@tc/event-client';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { Hash, HashSchema } from '@tc/hash/entities/hash.entity';
import { HashDbModule } from '@tc/hash/hash-db/hash-db.module';
import { HashModule } from '@tc/blockchain';
import { HashParsingService } from '@tc/hash/hash-parsing/hash-parsing.service';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import { ParsingModule } from '@tc/parsing';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ParsingModule,
    forwardRef(() => ParseModule),
    EventClientModule,
    HashDbModule,
    HashModule,
    MongooseModule.forFeature(
      [{ name: Hash.name, schema: HashSchema }],
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
