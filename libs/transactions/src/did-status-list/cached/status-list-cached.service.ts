import { CachedService } from '@tc/transactions/transactions/cache.service';
import {
  DidStatusList,
  DidStatusListResolver,
} from '@trustcerts/did-status-list';
import {
  DidStatusListDocument,
  StatusListDocumentDocument,
} from '../schemas/did-status-list.schema';
import {
  DidStatusListTransaction,
  StatusListTransactionDocument,
} from '../schemas/did-status-list-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { STATUSLIST_CONNECTION } from '../constants';

/**
 * Handles requests to get a cached statuslist.
 */
@Injectable()
export class StatusListCachedService extends CachedService<DidStatusListResolver> {
  /**
   * Injects required dependencies.
   * @param didModel
   */
  constructor(
    @InjectModel(DidStatusListTransaction.name, STATUSLIST_CONNECTION)
    protected transactionModel: Model<StatusListTransactionDocument>,
    @InjectModel(DidStatusList.name, STATUSLIST_CONNECTION)
    protected didModel: Model<StatusListDocumentDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidStatusListResolver();
  }

  /**
   * Requests a statuslist by id but throws an error if not found.
   * @param id
   * @returns
   */
  async getStatusListOrFail(id: string): Promise<DidStatusListDocument> {
    const statuslist = await this.getById<DidStatusListDocument>(id);
    if (!statuslist) {
      throw new NotFoundException('statuslist not found');
    }
    return statuslist;
  }

  /**
   * Returns a did object based on the cached values from the db
   * @param id
   * @returns
   */
  async getLatestDocument(id: string): Promise<DidStatusList> {
    const document: DidStatusListDocument =
      await this.getById<DidStatusListDocument>(id);
    const didId = new DidStatusList(id);
    didId.parseDocument({
      document: {
        '@context': [],
        id,
        controller: document.controller,
        encodedList: document.encodedList,
        statusPurpose: document.statusPurpose,
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
