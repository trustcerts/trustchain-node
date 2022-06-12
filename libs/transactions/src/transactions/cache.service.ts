import { Did } from './did/schemas/did.schema';
import { DidDocumentMetaData } from '@tc/transactions/transactions/did/dto/did-document-meta-data.dto';
import { DidId } from '@tc/transactions/did-id/schemas/did-id.schema';
import {
  DidResolver,
  SignatureContent,
  VerifierService,
} from '@trustcerts/did';
import { DidTransaction } from './did/schemas/did-transaction.schema';
import { DocResponse } from './did/dto/doc-response.dto';
import { Model, Schema } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { VersionInformation } from './did/version-information';

/**
 * Base service to interact with cached transactions from the database.
 */
export abstract class CachedService<Res extends DidResolver<VerifierService>> {
  /**
   * resolver instance to load dids.
   */
  protected resolver!: Res;

  /**
   * inject required models to query the database
   */
  constructor(
    // TODO replace type any for better usage
    // protected transactionModel: Model<DidTransaction>,
    // protected didModel: Model<DidDocument>,
    protected transactionModel: Model<any>,
    protected didModel: Model<any>,
  ) {}

  /**
   * checks if an issuer is listed as controller to manipulate the did document.
   */
  public canChange(issuerId: string, id: string): Promise<void> {
    return this.didModel
      .findOne({ id })
      .populate('controllers')
      .then((res) => {
        if (
          res.controllers.find(
            (controller: DidId) => (controller.id = issuerId),
          )
        ) {
          return Promise.resolve();
        } else {
          return Promise.reject();
        }
      });
  }

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
  public async getById<T extends Did>(id: string): Promise<T & Schema> {
    const did = await this.didModel.findOne({ id });
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
      const next = await this.transactionModel
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
        // TODO check if block timestamp is correct
        result.nextUpdate = new Date(next[0].block.createdAt).toISOString();
        result.nextVersionId = transactions.length + 1;
      }
    }
    // TODO set if did was deactivated
    return result;
  }

  /**
   * Returns a document based on the id and optional version parameters
   */
  async getDocument<T extends DocResponse>(
    id: string,
    version: { time: string; id: number },
  ): Promise<T> {
    // catch timestamps that are in the future
    if (version?.time) {
      try {
        new Date(version.time);
      } catch {
        version.time = new Date().toISOString();
      }
    }
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
    const transactions: DidTransaction[] = await query.exec();
    if (transactions.length === 0) {
      throw new NotFoundException();
    }
    const did = await this.resolver.load(id, {
      transactions: transactions.map((transaction) => transaction.values),
      time: version.time,
      validateChainOfTrust: false,
      doc: false,
    });
    return {
      document: did.getDocument(),
      signatures: transactions[transactions.length - 1].didDocumentSignature,
      metaData: await this.getDocumentMetaData(id, version),
    } as T;
  }

  /**
   * Returns all the transactions that belong to a did document.
   * @param id
   */
  async getTransactions<B extends DidTransaction>(
    id: string,
    version?: VersionInformation,
  ): Promise<B[]> {
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
