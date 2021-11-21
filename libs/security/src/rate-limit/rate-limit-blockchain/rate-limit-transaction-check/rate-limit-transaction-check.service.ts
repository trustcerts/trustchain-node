import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { Injectable } from '@nestjs/common';
import { RateLimitCachedService } from '@tc/security/rate-limit/rate-limit-cached/rate-limit-cached.service';
import { RoleManageAddEnum } from '@tc/did/constants';
import { SecurityLimitTransactionDto } from '../../security-limit.transaction.dto';
import { TransactionCheck } from '@shared/transaction.check';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
@Injectable()
export class RateLimitTransactionCheckService extends TransactionCheck {
  /**
   * Injects required services
   * @param blockCheckService
   * @param rateLimitCachedService
   */
  constructor(
    blockCheckService: BlockCheckService,
    private didCachedService: DidCachedService,
    protected rateLimitCachedService: RateLimitCachedService,
  ) {
    super(blockCheckService, rateLimitCachedService);
  }

  /**
   * Type of the transaction to pass it to the map of the block check.
   */
  protected getType(): TransactionType {
    return TransactionType.SecurityLimit;
  }

  /**
   * Checks if the issuer is authorized to set a rate limit
   */
  private async isIssuerAuthorized(transaction: SecurityLimitTransactionDto) {
    // check if the identifier is authorized.
    const issuer = await this.didCachedService.getDidByKey(
      transaction.signature.values[0].identifier,
    );
    issuer.roles.includes(RoleManageAddEnum.Gateway);
  }

  /**
   * Checks if there is already a transaction limitation in the batch.
   * @param newTransaction
   * @param addedTransactions
   */
  private checkDouble(
    newTransaction: SecurityLimitTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction) => {
      if (
        (transaction.body.type === TransactionType.SecurityLimit,
        newTransaction.body.value.identifier ===
          transaction.body.value.identifier)
      ) {
        throw new Error('transaction with limit already included');
      }
    });
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   */
  protected async getValidation(
    transaction: TransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    // TODO implement
    await this.isIssuerAuthorized(transaction);
    this.checkDouble(transaction, addedTransactions);
    return Promise.resolve();
  }
}
