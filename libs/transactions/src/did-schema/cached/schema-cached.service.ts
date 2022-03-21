import { CachedService } from '@tc/transactions/transactions/cache.service';
import { DidSchema, SchemaDocument } from '../schemas/did-schema.schema';
import { DidSchemaResolver } from '@trustcerts/schema-verify';
import {
  DidSchemaTransaction,
  SchemaTransactionDocument,
} from '../schemas/did-schema-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

/**
 * Handles requests to get a cached schema.
 */
@Injectable()
export class SchemaCachedService extends CachedService {
  protected resolver = new DidSchemaResolver();

  /**
   * Injects required dependencies.
   * @param schemaModel
   */
  constructor(
    @InjectModel(DidSchemaTransaction.name)
    protected transactionModel: Model<SchemaTransactionDocument>,
    @InjectModel(DidSchema.name)
    protected didModel: Model<SchemaDocument>,
  ) {
    super(transactionModel, didModel);
  }
}
