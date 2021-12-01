import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Did } from '@trustcerts/core';
import { DidDocument } from '@tc/did/schemas/did.schema';
import { Hash } from '@tc/hash/entities/hash.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';

/**
 * Service to track the requests
 */
@Injectable()
export class TrackingService {
  /**
   * Injects required connections
   * @param trackingModel
   * @param didModel
   */
  constructor(
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(Did.name)
    private didModel: Model<DidDocument>,
  ) {}

  /**
   * Stores the result in a log to parse it later
   * @param hash
   */
  public async save(hash: Hash, origin: string) {
    const issuer = await this.didModel.findOne({
      id: hash.signature[0].identifier.split('#')[0],
    });
    if (!issuer) {
      throw new ConflictException('issuer not found');
    }
    // const tracking = new this.trackingModel({
    //   hash: hash.hash,
    //   issuer: issuer.id,
    //   origin,
    // });
    // await tracking.save();
    this.logger.info({
      message: `${origin}: ${hash} was checked`,
      labels: { source: this.constructor.name, issuer },
    });
  }

  /**
   * Logs that the request failed
   * @param hash
   * @param origin
   */
  public async saveTry(hash: string, origin: string) {
    // const tracking = new this.trackingModel({ hash, origin });
    // await tracking.save();
    this.logger.info({
      message: `${origin}: ${hash} was not found`,
      labels: { source: this.constructor.name },
    });
  }

  /**
   * Resets the table.
   */
  async reset() {
    // await this.trackingModel.deleteMany({});
  }
}
