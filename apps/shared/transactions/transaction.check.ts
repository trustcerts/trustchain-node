import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { CachedService } from '../cache.service';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { Logger } from 'winston';
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
    protected didCachedService: DidIdCachedService,
    protected readonly logger: Logger,
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
   * In case the signer does not match with an already existing entry, throw an error.
   * Check will pass if the transaction does not exists yet or the signer is authorized.
   * @param transaction
   */
  async canUpdatebyController(transaction: TransactionDto): Promise<void> {
    return this.didCachedService
      .getDid(transaction.body.value.id, 'controllers')
      .then(
        (did) => {
          for (const signer of transaction.signature.values) {
            const signerId = signer.identifier.split('#')[0];
            if (
              !did.controllers.find((controller) => controller.id === signerId)
            ) {
              throw new Error(
                `${signerId} is not authorized to update ${transaction.body.value.id}`,
              );
            }
            return Promise.resolve();
          }
        },
        // did not found, so resolve it since there is no controller set yet
        (err: Error) => {
          if (err.message !== 'not found') {
            this.logger.error(err);
          }
          return Promise.resolve();
        },
      );
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
