import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { DidId } from '@trustcerts/did';
import { DidIdDbModule } from '../db/did-id-db.module';
import { DidIdParsingService } from './did-id-parsing.service';
import { DidIdSchema } from '../schemas/did-id.schema';
import {
  DidIdTransaction,
  DidTransactionSchema,
} from '@tc/transactions/did-id/schemas/did-id-transaction.schema';
import { EventClientModule } from '@tc/clients/event-client';
import { HashModule } from '@tc/blockchain';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { StateModule } from '@apps/parse/src/state/state.module';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashModule,
    DidIdDbModule,
    StateModule,
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
