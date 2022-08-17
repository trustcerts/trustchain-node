import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { DidStatusListResolver } from '@trustcerts/did-status-list';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { StatusListCachedService } from '@tc/transactions/did-status-list/cached/status-list-cached.service';
import { StatusListTransactionDto } from '../dto/status-list.transaction.dto';
import { TransactionCheck } from '@tc/transactions/transactions/transaction-check.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Validates a statuslist before it gets into a block.
 */
@Injectable()
export class StatusListTransactionCheckService extends TransactionCheck<DidStatusListResolver> {
  /**
   * Injects required services
   * @param blockCheckService
   * @param statuslistCachedService
   */
  constructor(
    protected readonly blockCheckService: BlockCheckService,
    protected readonly statuslistCachedService: StatusListCachedService,
    protected readonly didCachedService: DidIdCachedService,
    @Inject('winston') logger: Logger,
  ) {
    super(blockCheckService, statuslistCachedService, didCachedService, logger);
  }

  /**
   * Type of the transaction
   * @returns
   */
  protected getType(): TransactionType {
    return TransactionType.StatusList;
  }

  /**
   * Returns the identifier that is allowed to make these kind of transactions.
   * @returns
   */
  protected getIdentifier(): DidRoles {
    return DidRoles.Client;
  }

  /**
   * Checks if statuslist is already in the list.
   * @param newTransaction
   * @param addedTransactions
   */
  public checkDoubleStatusList(
    newTransaction: StatusListTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction) => {
      if (
        transaction.body.type === TransactionType.StatusList &&
        newTransaction.body.value.id ===
          (transaction as StatusListTransactionDto).body.value.id
      ) {
        throw new Error('Double entry');
      }
    });
  }

  /**
   * Returns the validation rules that are specific for this transaction type.
   * @param transaction
   * @param addedTransactions
   * @returns
   */
  protected getValidation(
    transaction: StatusListTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDoubleStatusList(transaction, addedTransactions);
    return Promise.resolve();
  }
}
