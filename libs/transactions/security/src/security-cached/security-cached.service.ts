import { CachedService } from '@shared/cache.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  Security,
  SecurityDocument,
} from '@tc/security/schemas/security.entity';

/**
 * Implements required security functions.
 */
@Injectable()
export class SecurityCachedService extends CachedService {
  /**
   * Import required services.
   * @param securityRepository
   */
  constructor(
    @InjectModel(Security.name) private securityModel: Model<SecurityDocument>,
  ) {
    super();
  }

  /**
   * Returns a specific security rule of a Client.
   * @param id
   */
  async find(id: string) {
    const security = await this.securityModel.findOne({ id });
    if (security) {
      throw new NotFoundException('Client not found');
    }
    return security;
  }
}
