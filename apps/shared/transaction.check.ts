import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { CachedService } from './cache.service';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { sortKeys } from '@trustcerts/core';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
export abstract class TransactionCheck {
  /**
   * Registers the implemented function at the block check so the transaction can be checked.
   * @param blockCheckService
   * @param cachedService
   */
  constructor(
    blockCheckService: BlockCheckService,
    protected cachedService: CachedService,
  ) {
    if (blockCheckService.types.has(this.getType())) {
      throw Error(this.getType());
    }
    blockCheckService.types.set(this.getType(), {
      hash: this.getHash.bind(this),
      signature: this.getSignature.bind(this),
      signatureAmount: this.getSignatureAmount.bind(this),
      validation: this.getValidation.bind(this),
      cachedService,
    });
  }

  /**
   * Type of the transaction to pass it to the map of the block check.
   */
  protected abstract getType(): TransactionType;

  /**
   * Returns the signatures of the transaction in an array, even if only one is required.
   * @param transaction
   */
  protected getSignature(transaction: TransactionDto): SignatureDto[] {
    return transaction.signature.values;
  }

  /**
   * Calculates of a transaction and returns a sorted json string.
   * @param transaction
   */
  public getHash(transaction: TransactionDto): string {
    return JSON.stringify(sortKeys(this.cachedService.getValues(transaction)));
  }

  /**
   * Amount of signatures that are required for this type of transaction.
   */
  protected getSignatureAmount() {
    return 1;
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   */
  protected abstract getValidation(
    transaction: TransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void>;
}
