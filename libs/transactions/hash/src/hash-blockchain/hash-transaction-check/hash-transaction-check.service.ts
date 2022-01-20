import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashDocument } from '@tc/hash/schemas/hash.schema';
import { HashTransactionDto } from '@tc/hash/dto/hash.transaction.dto';
import { Model } from 'mongoose';
import { RoleManageAddEnum } from '@tc/did-id/constants';
import { TransactionCheck } from '@shared/transactions/transaction.check';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
export abstract class HashTransactionCheckService extends TransactionCheck {
  /**
   * Injects required services
   * @param hashModel
   * @param blockCheckService
   * @param hashCachedService
   */
  protected constructor(
    protected readonly hashModel: Model<HashDocument>,
    protected readonly blockCheckService: BlockCheckService,
    protected readonly hashCachedService: HashCachedService,
    protected readonly didCachedService: DidIdCachedService,
  ) {
    super(blockCheckService, hashCachedService, didCachedService);
  }

  /**
   * Checks if hash is already in the proposed transaction list.
   * @param newTransaction
   * @param addedTransactions
   */
  public checkDoubleHash(
    newTransaction: HashTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction: TransactionDto) => {
      if (
        [TransactionType.HashCreation, TransactionType.HashRevocation].includes(
          transaction.body.type,
        ) &&
        newTransaction.body.value.hash ===
          (transaction as HashTransactionDto).body.value.hash
      ) {
        throw new Error('Double hash creation');
      }
    });
  }

  /**
   * Returns the hash based on the hash.
   * @param hash
   */
  protected async findHash(hash: string) {
    return this.hashModel.findOne({ hash });
  }

  /**
   * Authorized identifier that is able to add this type of transaction.
   */
  protected getIdentifier(): RoleManageAddEnum {
    return RoleManageAddEnum.Client;
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   */
  getValidation(
    transaction: TransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDoubleHash(transaction as HashTransactionDto, addedTransactions);
    return Promise.resolve();
  }
}
