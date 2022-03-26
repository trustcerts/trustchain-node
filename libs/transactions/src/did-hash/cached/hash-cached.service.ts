import { CachedService } from '@tc/transactions/transactions/cache.service';
import {
  DidHash,
  HashDocument,
} from '@tc/transactions/did-hash/schemas/did-hash.schema';
import {
  DidHashTransaction,
  HashTransactionDocument,
} from '../schemas/did-hash-transaction.schema';
import { DidSignatureResolver } from '@trustcerts/signature-verify';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
/**
 * Service to interact with hashes.
 */
@Injectable()
export class HashCachedService extends CachedService<DidSignatureResolver> {
  /**
   * Injects the required services and repositories.
   * @param didModel
   */
  constructor(
    @InjectModel(DidHash.name) protected didModel: Model<HashDocument>,
    @InjectModel(DidHashTransaction.name)
    protected transactionModel: Model<HashTransactionDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidSignatureResolver();
  }

  /**
   * Returns the hash based on the hash.
   * @param hash
   */
  getHash(hash: string) {
    return this.didModel.findOne({ id: hash });
  }
}
