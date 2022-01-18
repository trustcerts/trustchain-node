import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SCHEMA_CONNECTION } from '../constants';
import { Schema, SchemaSchema } from '../schemas/schema.schema';
import { SchemaCachedService } from './schema-cached.service';
import { SchemaDbModule } from '../schema-db/schema-db.module';
import {
  SchemaTransaction,
  SchemaTransactionSchema,
} from '../schemas/schema-transaction.schema';

@Module({
  imports: [
    SchemaDbModule,
    MongooseModule.forFeature(
      [
        { name: Schema.name, schema: SchemaSchema },
        { name: SchemaTransaction.name, schema: SchemaTransactionSchema },
      ],
      SCHEMA_CONNECTION,
    ),
  ],
  providers: [SchemaCachedService],
  exports: [SchemaCachedService],
})
export class SchemaCachedModule {}
