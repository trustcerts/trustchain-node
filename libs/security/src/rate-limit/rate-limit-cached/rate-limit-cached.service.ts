import { CachedService } from '@shared/cache.service';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashTransactionDto } from '@tc/hash/schemas/hash.transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Security, SecurityDocument } from '@tc/security/security.entity';

/**
 * Manages the amount of hashes a Client is allowed to sign monthly.
 */
@Injectable()
export class RateLimitCachedService extends CachedService {
  /**
   * Imports required services.
   * @param hashService
   * @param securityRepository
   */
  constructor(
    private readonly hashService: HashCachedService,
    @InjectModel(Security.name)
    private securityRepository: Model<SecurityDocument>,
  ) {
    super();
  }

  /**
   * Checks if the amount of signed values is greater than the defined limit.
   * @param transaction
   */
  // TODO use it as a block check in transaction check
  async limitReached(transaction: HashTransactionDto) {
    const keyId = transaction.signature.values[0].identifier;
    // TODO add current transactions to make sure the user does not include more than he should, transactions in pool are excluded.
    const limit = await this.getLimit(keyId);
    // Limit is not set or entry for user does not exist
    if (limit === 0) {
      return false;
    }
    const current = await this.getCurrent(keyId);
    return current >= limit;
  }

  /**
   * Returns the set limit of the user.
   * @param id
   */
  private getLimit(id: string) {
    return this.securityRepository.findOne({ id }).then((user) => {
      return user?.limit ?? 0;
    });
  }

  /**
   * Returns current value from the current month that is already parsed in the database.
   * @param keyId
   */
  private async getCurrent(keyId: string) {
    const begin = new Date();
    begin.setDate(1);
    begin.setHours(0);
    begin.setMinutes(0);
    const to = new Date();
    to.setMonth(to.getMonth() + 1);
    to.setDate(1);
    to.setHours(0);
    to.setMinutes(0);
    return this.hashService
      .countHashes({
        client: keyId,
        from: begin.toISOString(),
        to: to.toISOString(),
      })
      .catch(() => {
        throw new NotFoundException('user not found');
      });
  }
}
