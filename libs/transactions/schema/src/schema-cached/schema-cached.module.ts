import { DidSchema, SchemaSchema } from '../schemas/did-schema.schema';
import {
  DidSchemaTransaction,
  SchemaTransactionSchema,
} from '../schemas/did-schema-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SCHEMA_CONNECTION } from '../constants';
import { SchemaCachedService } from './schema-cached.service';
import { SchemaDbModule } from '../schema-db/schema-db.module';

@Module({
  imports: [
    SchemaDbModule,
    MongooseModule.forFeature(
      [
        { name: DidSchema.name, schema: SchemaSchema },
        { name: DidSchemaTransaction.name, schema: SchemaTransactionSchema },
      ],
      SCHEMA_CONNECTION,
    ),
  ],
  providers: [SchemaCachedService],
  exports: [SchemaCachedService],
})
export class SchemaCachedModule {}
