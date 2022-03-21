import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { DidId, DidIdSchema } from '../schemas/did-id.schema';
import { DidIdDbModule } from '../db/did-id-db.module';
import { DidIdParsingService } from './did-id-parsing.service';
import {
  DidIdTransaction,
  DidTransactionSchema,
} from '@tc/transactions/did-id/schemas/did-id-transaction.schema';
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
    DidIdDbModule,
    MongooseModule.forFeature(
      [
        { name: DidIdTransaction.name, schema: DidTransactionSchema },
        { name: DidId.name, schema: DidIdSchema },
      ],
      DID_ID_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    DidIdParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
})
export class DidIdParsingModule {}
