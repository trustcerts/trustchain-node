import { DID_CONNECTION } from '@tc/did/constants';
import { DidDbModule } from '../did-db/did-db.module';
import { DidId, DidIdSchema } from '../schemas/did.schema';
import {
  DidIdTransaction,
  DidTransactionSchema,
} from '@tc/did/schemas/did-transaction.schema';
import { DidParsingService } from './did-parsing.service';
import { EventClientModule } from '@tc/event-client';
import { HashModule } from '@tc/blockchain';
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
    HashModule,
    DidDbModule,
    MongooseModule.forFeature(
      [
        { name: DidIdTransaction.name, schema: DidTransactionSchema },
        { name: DidId.name, schema: DidIdSchema },
      ],
      DID_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    DidParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
})
export class DidParsingModule {}
