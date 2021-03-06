import { CachedService } from '@tc/transactions/transactions/cache.service';
import { DidSchema, SchemaDocument } from '../schemas/did-schema.schema';
import { DidSchemaResolver } from '@trustcerts/did-schema';
import {
  DidSchemaTransaction,
  SchemaTransactionDocument,
} from '../schemas/did-schema-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SCHEMA_CONNECTION } from '../constants';

/**
 * Handles requests to get a cached schema.
 */
@Injectable()
export class SchemaCachedService extends CachedService<DidSchemaResolver> {
  /**
   * Injects required dependencies.
   * @param schemaModel
   */
  constructor(
    @InjectModel(DidSchemaTransaction.name, SCHEMA_CONNECTION)
    protected transactionModel: Model<SchemaTransactionDocument>,
    @InjectModel(DidSchema.name, SCHEMA_CONNECTION)
    protected didModel: Model<SchemaDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidSchemaResolver();
  }
}
