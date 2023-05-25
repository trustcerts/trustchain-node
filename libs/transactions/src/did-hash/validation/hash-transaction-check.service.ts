import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidHashDocument } from '@tc/transactions/did-hash/schemas/did-hash.schema';
import { DidHashResolver } from '@trustcerts/did-hash';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { HashCachedService } from '@tc/transactions/did-hash/cached/hash-cached.service';
import { HashDidTransactionDto } from '@tc/transactions/did-hash/dto/hash-transaction.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { TransactionCheck } from '@tc/transactions/transactions/transaction-check.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
@Injectable()
export class HashTransactionCheckService extends TransactionCheck<DidHashResolver> {
  /**
   * Injects required services
   * @param hashModel
   * @param blockCheckService
   * @param hashCachedService
   */
  constructor(
    protected readonly blockCheckService: BlockCheckService,
    protected readonly hashCachedService: HashCachedService,
    protected readonly didCachedService: DidIdCachedService,
    @Inject('winston') logger: Logger,
  ) {
    super(blockCheckService, hashCachedService, didCachedService, logger);
  }

  /**
   * Checks if hash is already in the proposed transaction list.
   * @param newTransaction
   * @param addedTransactions
   */
  public checkDoubleHash(
    newTransaction: HashDidTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction: TransactionDto) => {
      if (
        TransactionType.Hash === transaction.body.type &&
        newTransaction.body.value.id ===
          (transaction as HashDidTransactionDto).body.value.id
      ) {
        throw new Error('Double hash creation');
      }
    });
  }

  /**
   * Checks if the new element has a controller.
   */
  hasController(transaction: HashDidTransactionDto) {
    return this.cachedService.getById(transaction.body.value.id).then(
      () => Promise.resolve(),
      () => {
        if (
          transaction.body.value.controller &&
          transaction.body.value.controller.add &&
          transaction.body.value.controller.add.length > 0
        ) {
          return Promise.resolve();
        } else {
          throw new Error('no controller for');
        }
      },
    );
  }

  /**
   * Checks if hash is already in the database.
   * @param transaction
   */
  public async checkDoubleHashDB(transaction: HashDidTransactionDto) {
    const hash = await this.findHash(transaction.body.value.id);
    if (hash) {
      throw new Error(`Hash already signed: ${transaction.body.value.id}`);
    }
  }

  /**
   * Returns the type of the transaction.
   */
  protected getType(): TransactionType {
    return TransactionType.Hash;
  }

  /**
   * Returns the hash based on the hash.
   * @param hash
   */
  protected async findHash(hash: string) {
    return this.cachedService.getById<DidHashDocument>(hash);
  }

  /**
   * Authorized identifier that is able to add this type of transaction.
   */
  protected getIdentifier(): DidRoles {
    return DidRoles.Client;
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   */
  async getValidation(
    transaction: HashDidTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDoubleHash(transaction, addedTransactions);
    await this.hasController(transaction);
    return Promise.resolve();
  }
}
