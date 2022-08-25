import { CachedService } from '@tc/transactions/transactions/cache.service';
import { DidHash, DidHashResolver } from '@trustcerts/did-hash';
import {
  DidHashDocument,
  HashDocumentDocument,
} from '@tc/transactions/did-hash/schemas/did-hash.schema';
import {
  DidHashTransaction,
  HashTransactionDocument,
} from '../schemas/did-hash-transaction.schema';
import { HASH_CONNECTION } from '../constants';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
/**
 * Service to interact with hashes.
 */
@Injectable()
export class HashCachedService extends CachedService<DidHashResolver> {
  /**
   * Injects the required services and repositories.
   * @param didModel
   */
  constructor(
    @InjectModel(DidHash.name, HASH_CONNECTION)
    protected didModel: Model<HashDocumentDocument>,
    @InjectModel(DidHashTransaction.name, HASH_CONNECTION)
    protected transactionModel: Model<HashTransactionDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidHashResolver();
  }

  /**
   * Returns the hash based on the hash.
   * @param hash
   */
  getHash(hash: string) {
    return this.didModel.findOne({ id: hash });
  }

  /**
   * Returns a did object based on the cached values from the db
   * @param id
   * @returns
   */
  async getLatestDocument(id: string): Promise<DidHash> {
    const document: DidHashDocument = await this.getById<DidHashDocument>(id);
    const didId = new DidHash(id);
    didId.parseDocument({
      document: {
        '@context': [],
        id,
        controller: document.controller,
        algorithm: document.algorithm,
        revoked: document.revoked?.toString(),
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
