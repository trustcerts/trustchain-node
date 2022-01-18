import { EventClientModule } from '@tc/event-client';
import { HashModule } from '@tc/blockchain';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { SCHEMA_CONNECTION } from '../constants';
import { Schema, SchemaSchema } from '../schemas/schema.schema';
import { SchemaDbModule } from '../schema-db/schema-db.module';
import { SchemaParsingService } from './schema-parsing.service';
import {
  SchemaTransaction,
  SchemaTransactionSchema,
} from '../schemas/schema-transaction.schema';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashModule,
    SchemaDbModule,
    MongooseModule.forFeature(
      [
        { name: Schema.name, schema: SchemaSchema },
        { name: SchemaTransaction.name, schema: SchemaTransactionSchema },
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
})
export class SchemaParsingModule {}
