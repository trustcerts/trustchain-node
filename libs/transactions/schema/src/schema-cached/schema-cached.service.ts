import { CachedService } from '@shared/cache.service';
import { Did } from '@trustcerts/core';
import { DidManagerConfigValues } from '@trustcerts/core/dist/did/DidManagerConfigValues';
import { DidSchemaDocument } from '../dto/did-schema-document';
import { InitDidManagerConfigValues } from '@trustcerts/core/dist/did/InitDidManagerConfigValues';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Schema, SchemaDocument } from '../schemas/schema.schema';
import { SchemaDocResponse } from '../dto/schema-doc-response';
import {
  SchemaTransaction,
  SchemaTransactionDocument,
} from '../schemas/schema-transaction.schema';
import { VersionInformation } from '@shared/did/version-information';

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
    super(transactionModel, didModel);
  }

  /**
   * Returns an assembled did document with the transaction
   * @param id
   * @param version
   * @returns
   */
  async getDocument(
    id: string,
    version?: VersionInformation,
  ): Promise<SchemaDocResponse> {
    const query = this.transactionModel
      .find({
        id,
        createdAt: {
          $lte: version?.time
            ? new Date(version.time).toISOString()
            : new Date().toISOString(),
        },
      })
      .sort('createdAt');
    if (version?.id) {
      query.limit(version.id);
    }
    const transactions = await query.exec();
    if (transactions.length === 0) {
      throw new NotFoundException();
    }
    // TODO set correct resolver
    const did: Did = await DidResolver.load(id, {
      transactions: transactions as SchemaTransaction[],
      validateChainOfTrust: false,
      doc: false,
    });
    return {
      document: did.getDocument() as DidSchemaDocument,
      signatures: transactions[transactions.length - 1].didDocumentSignature,
      metaData: await this.getDocumentMetaData(id, version),
    };
  }
}

// TODO dunny class
export declare class DidResolver {
  static init(): void;
  protected static loadDid(
    did: Did,
    config: DidManagerConfigValues,
  ): Promise<void>;
  public static load(
    id: string,
    config: InitDidManagerConfigValues,
  ): Promise<Did>;
}
