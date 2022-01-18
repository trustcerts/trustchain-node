import { DidDocumentMetaData } from './did/did-document-meta-data';
import { DidTransaction } from './did/schemas/did-transaction.schema';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { SignatureContent } from '@trustcerts/core';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { VersionInformation } from './did/version-information';

/**
 * Base service to interact with cached transactions from the database.
 */
export abstract class CachedService {
  constructor(
    protected transactionModel: Model<any>,
    protected didModel: Model<any>,
  ) {}

  /**
   * Returns the values of the transaction that are used generate a signature of a transaction.
   * @param transaction
   */
  public getValues(transaction: TransactionDto): SignatureContent {
    return {
      date: transaction.body.date,
      value: transaction.body.value,
      type: transaction.body.type,
    };
  }

  /**
   * Returns a did by id.
   * @param id
   * @returns
   */
  public async getById<Type>(id: string): Promise<Type> {
    const did = await this.didModel.findById(id);
    if (!did) {
      throw Error(`${id} not found`);
    }
    return did;
  }

  /**
   * Return the metadata to a did document.
   * @param id
   * @param until
   */
  async getDocumentMetaData(
    id: string,
    version?: VersionInformation,
  ): Promise<DidDocumentMetaData> {
    const transactions = await this.getTransactions(id, version);
    if (transactions.length === 0) {
      throw new NotFoundException('did not found');
    }
    const result: DidDocumentMetaData = {
      created: new Date(transactions[0].createdAt).toISOString(),
      versionId: transactions.length,
    };
    // set update if there are more transactions
    if (transactions.length > 1) {
      result.updated = new Date(
        transactions[transactions.length - 1].createdAt,
      ).toISOString();
    }
    if (version?.time || version?.id) {
      // check if there are more elements
      const next = await this.didModel
        .find({
          id,
          createdAt: {
            // TODO check if 0 is correct
            $gte: version?.time
              ? new Date(version.time).toISOString()
              : new Date(0).toISOString(),
          },
        })
        .sort('createdAt')
        .limit(1)
        .skip(version.id ?? 0);
      if (next[0]) {
        result.nextUpdate = new Date(next[0].createdAt).toISOString();
        result.nextVersionId = transactions.length + 1;
      }
    }
    // TODO set if did was deactivated
    return result;
  }

  /**
   * Returns all the transactions that belong to a did document.
   * @param id
   */
  async getTransactions(
    id: string,
    version?: VersionInformation,
  ): Promise<DidTransaction[]> {
    const query = this.transactionModel
      .find({
        id,
        createdAt: {
          $lte: version?.time
            ? new Date(version.time).toISOString()
            : new Date().toISOString(),
        },
      })
      .sort('createdAt');
    if (version?.id) {
      query.limit(version.id);
    }
    return query.exec();
  }
}
