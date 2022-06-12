import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { DidSchema, SchemaSchema } from '../schemas/did-schema.schema';
import {
  DidSchemaTransaction,
  SchemaTransactionSchema,
} from '../schemas/did-schema-transaction.schema';
import { EventClientModule } from '@tc/clients/event-client';
import { HashModule } from '@tc/blockchain';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { SCHEMA_CONNECTION } from '../constants';
import { SchemaDbModule } from '../db/schema-db.module';
import { SchemaParsingService } from './schema-parsing.service';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashModule,
    SchemaDbModule,
    DidIdCachedModule,
    MongooseModule.forFeature(
      [
        { name: DidSchema.name, schema: SchemaSchema },
        { name: DidSchemaTransaction.name, schema: SchemaTransactionSchema },
      ],
      SCHEMA_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    SchemaParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
  exports: [MongooseModule],
})
export class SchemaParsingModule {}
