import { CachedService } from '@tc/transactions/transactions/cache.service';
import {
  DidStatusList,
  StatusListDocument,
} from '../schemas/did-status-list.schema';
import { DidStatusListResolver } from '@trustcerts/did-status-list';
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
    protected didModel: Model<StatusListDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidStatusListResolver();
  }

  /**
   * Requests a statuslist by id but throws an error if not found.
   * @param id
   * @returns
   */
  async getStatusListOrFail(id: string): Promise<DidStatusList> {
    const statuslist = await this.getById<DidStatusList>(id);
    if (!statuslist) {
      throw new NotFoundException('statuslist not found');
    }
    return statuslist;
  }
}
