import { CachedService } from '@tc/transactions/transactions/cache.service';
import {
  DidVisualRepresentation,
  DidVisualRepresentationResolver,
} from '@trustcerts/did-visual-representation';
import {
  DidVisualRepresentationDocument,
  VisualRepresentationDocumentDocument,
} from '../schemas/did-visual-representation.schema';
import {
  DidVisualRepresentationTransaction,
  VisualRepresentationTransactionDocument,
} from '../schemas/did-visual-representation-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { VISUALREPRESENTATION_CONNECTION } from '../constants';

/**
 * Handles requests to get a cached visualrepresentation.
 */
@Injectable()
export class VisualRepresentationCachedService extends CachedService<any> {
  /**
   * Injects required dependencies.
   * @param didModel
   */
  constructor(
    @InjectModel(
      DidVisualRepresentationTransaction.name,
      VISUALREPRESENTATION_CONNECTION,
    )
    protected transactionModel: Model<VisualRepresentationTransactionDocument>,
    @InjectModel('DidVisualRepresentation', VISUALREPRESENTATION_CONNECTION)
    protected didModel: Model<VisualRepresentationDocumentDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidVisualRepresentationResolver();
  }

  /**
   * Requests a visualrepresentation by id but throws an error if not found.
   * @param id
   * @returns
   */
  async getVisualRepresentationOrFail(
    id: string,
  ): Promise<DidVisualRepresentationDocument> {
    const visualrepresentation =
      await this.getById<DidVisualRepresentationDocument>(id);
    if (!visualrepresentation) {
      throw new NotFoundException('visualrepresentation not found');
    }
    return visualrepresentation;
  }

  /**
   * Returns a did object based on the cached values from the db
   * @param id
   * @returns
   */
  async getLatestDocument(id: string): Promise<any> {
    const document: DidVisualRepresentationDocument =
      await this.getById<DidVisualRepresentationDocument>(id);
    const didId = new DidVisualRepresentation(id);
    didId.parseDocument({
      document: {
        '@context': [],
        id,
        controller: document.controller,
        presentation: document.presentation,
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
