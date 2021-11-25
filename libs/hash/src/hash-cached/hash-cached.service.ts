import { CachedService } from '@shared/cache.service';
import { Hash, HashDocument } from '@tc/hash/entities/hash.entity';
import { HashFilterDto } from '../../../../apps/http-gateway/src/gateway-hash/hash-filter.dto';
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
   * @param hashModel
   */
  constructor(@InjectModel(Hash.name) private hashModel: Model<HashDocument>) {
    super();
  }

  /**
   * Returns the hash based on the hash.
   * @param hash
   */
  getHash(hash: string) {
    return this.hashModel.findOne({ hash });
  }

  /**
   * Counts the amount of hashes based on parameters
   * @param filter
   */
  async countHashes(filter: HashFilterDto) {
    const options = await this.setFilter(filter);
    return this.hashModel.count(options);
  }

  // TODO implement rate limit
  /**
   * Set filters depending on the given parameters.
   * @param filter
   */
  private async setFilter(filter: HashFilterDto) {
    const options: { signature?: any; createdAt?: any } = {};
    throw new Error('not implemented yet');
    // if (filter.client) {
    //   const id = await this.didCachedService.getIdentifierOfKey(filter.client);
    //   options.signature = Like(id);
    // }
    // if (filter.to && filter.from) {
    //   options.createdAt = Between(filter.from, filter.to);
    // } else if (filter.from) {
    //   options.createdAt = MoreThanOrEqual(filter.from);
    // } else if (filter.to) {
    //   options.createdAt = LessThanOrEqual(filter.to);
    // }
    return options;
  }
}
