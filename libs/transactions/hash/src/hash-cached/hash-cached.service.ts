import { CachedService } from '@shared/cache.service';
import { Hash, HashDocument } from '@tc/hash/schemas/hash.schema';
import { HashFilterDto } from '../dto/hash-filter.dto';
import {
  HashTransaction,
  HashTransactionDocument,
} from '../schemas/hash-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
/**
 * Service to interact with hashes.
 */
@Injectable()
export class HashCachedService extends CachedService {
  /**
   * Injects the required services and repositories.
   * @param didModel
   */
  constructor(
    @InjectModel(Hash.name) protected didModel: Model<HashDocument>,
    @InjectModel(HashTransaction.name)
    protected transactionModel: Model<HashTransactionDocument>,
  ) {
    super(transactionModel, didModel);
  }

  /**
   * Returns the hash based on the hash.
   * @param hash
   */
  getHash(hash: string) {
    return this.didModel.findOne({ hash });
  }

  /**
   * Counts the amount of hashes based on parameters
   * @param filter
   */
  async countHashes(filter: HashFilterDto) {
    const options = await this.setFilter(filter);
    return this.didModel.count(options);
  }

  // TODO implement rate limit
  /**
   * Set filters depending on the given parameters.
   * @param filter
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async setFilter(filter: HashFilterDto) {
    const options: { signature?: any; createdAt?: any } = {};
    return options;
  }
}
