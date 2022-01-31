import { CachedService } from '@shared/cache.service';
import { DidResolver } from '@trustcerts/core';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Schema, SchemaDocument } from '../schemas/schema.schema';
import {
  SchemaTransaction,
  SchemaTransactionDocument,
} from '../schemas/schema-transaction.schema';

/**
 * Handles requests to get a cached schema.
 */
@Injectable()
export class SchemaCachedService extends CachedService {
  /**
   * Injects required dependencies.
   * @param schemaModel
   */
  constructor(
    @InjectModel(SchemaTransaction.name)
    protected transactionModel: Model<SchemaTransactionDocument>,
    @InjectModel(Schema.name)
    protected didModel: Model<SchemaDocument>,
  ) {
    super(transactionModel, didModel, DidResolver.load);
  }
}
