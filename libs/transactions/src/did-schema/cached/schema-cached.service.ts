import { CachedService } from '@tc/transactions/transactions/cache.service';
import { DidSchema, DidSchemaResolver } from '@trustcerts/did-schema';
import {
  DidSchemaDocument,
  SchemaDocumentDocument,
} from '../schemas/did-schema.schema';
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
    protected didModel: Model<SchemaDocumentDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidSchemaResolver();
  }

  /**
   * Returns a did object based on the cached values from the db
   * @param id
   * @returns
   */
  async getLatestDocument(id: string): Promise<DidSchema> {
    const document: DidSchemaDocument = await this.getById<DidSchemaDocument>(
      id,
    );
    const didId = new DidSchema(id);
    didId.parseDocument({
      document: {
        '@context': [],
        id,
        controller: document.controller,
        value: document.value,
      },
      metaData: {
        versionId: didId.version,
        created: '',
      },
      signatures: {
        type: 'Single',
        values: [],
      },
    });
    return didId;
  }
}
