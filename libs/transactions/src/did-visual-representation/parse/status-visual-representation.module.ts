import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
// import { DidVisualRepresentation } from '@trustcerts/did-visual-representation';
import {
  DidVisualRepresentationTransaction,
  VisualRepresentationTransactionSchema,
} from '../schemas/did-visual-representation-transaction.schema';
import { EventClientModule } from '@tc/clients/event-client';
import { HashModule } from '@tc/blockchain';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { SchemaCachedModule } from '@tc/transactions/did-schema/cached/schema-cached.module';
import { VISUALREPRESENTATION_CONNECTION } from '../constants';
import { VisualRepresentationDbModule } from '../db/visual-representation-db.module';
import { VisualRepresentationParsingService } from './status-visual-representation.service';
import { VisualRepresentationSchema } from '../schemas/did-visual-representation.schema';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashModule,
    VisualRepresentationDbModule,
    DidIdCachedModule,
    SchemaCachedModule,
    MongooseModule.forFeature(
      [
        {
          name: 'DidVisualRepresentation',
          schema: VisualRepresentationSchema,
        },
        {
          name: DidVisualRepresentationTransaction.name,
          schema: VisualRepresentationTransactionSchema,
        },
      ],
      VISUALREPRESENTATION_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    VisualRepresentationParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
})
export class VisualRepresentationParsingModule {}
