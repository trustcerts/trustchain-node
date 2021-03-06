import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { DidHash } from '@tc/transactions/did-hash/schemas/did-hash.schema';
import {
  DidId,
  DidIdDocument,
} from '@tc/transactions/did-id/schemas/did-id.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { TRACKING_CONNECTION } from './constants';
import { Tracking, TrackingDocument } from './schemas/tracking.schema';

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
    @InjectModel(DidId.name, DID_ID_CONNECTION)
    private didModel: Model<DidIdDocument>,
    @InjectModel(Tracking.name, TRACKING_CONNECTION)
    private trackingModel: Model<TrackingDocument>,
  ) {}

  /**
   * Stores the result in a log to parse it later
   * @param hash
   */
  public async save(hash: DidHash, origin: string) {
    // TODO implement again
    const issuer = await this.didModel.findOne({
      id: hash.signature.values[0].identifier.split('#')[0],
    });
    if (!issuer) {
      throw new ConflictException('issuer not found');
    }
    const tracking = new this.trackingModel({
      hash: hash.id,
      issuer: issuer.id,
      origin,
    });
    await tracking.save();
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
