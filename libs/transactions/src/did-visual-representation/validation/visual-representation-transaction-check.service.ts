import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { DidVisualRepresentationResolver } from '@trustcerts/did-visual-representation';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { TransactionCheck } from '@tc/transactions/transactions/transaction-check.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { VisualRepresentationCachedService } from '@tc/transactions/did-visual-representation/cached/visual-representation-cached.service';
import { VisualRepresentationTransactionDto } from '../dto/visual-representation.transaction.dto';

/**
 * Validates a visualrepresentation before it gets into a block.
 */
@Injectable()
export class VisualRepresentationTransactionCheckService extends TransactionCheck<DidVisualRepresentationResolver> {
  /**
   * Injects required services
   * @param blockCheckService
   * @param visualrepresentationCachedService
   */
  constructor(
    protected readonly blockCheckService: BlockCheckService,
    protected readonly visualrepresentationCachedService: VisualRepresentationCachedService,
    protected readonly didCachedService: DidIdCachedService,
    @Inject('winston') logger: Logger,
  ) {
    super(
      blockCheckService,
      visualrepresentationCachedService,
      didCachedService,
      logger,
    );
  }

  /**
   * Type of the transaction
   * @returns
   */
  protected getType(): TransactionType {
    return TransactionType.VisualRepresentation;
  }

  /**
   * Returns the identifier that is allowed to make these kind of transactions.
   * @returns
   */
  protected getIdentifier(): DidRoles {
    return DidRoles.Client;
  }

  /**
   * Checks if visualrepresentation is already in the list.
   * @param newTransaction
   * @param addedTransactions
   */
  public checkDoubleVisualRepresentation(
    newTransaction: VisualRepresentationTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction) => {
      if (
        transaction.body.type === TransactionType.VisualRepresentation &&
        newTransaction.body.value.id ===
          (transaction as VisualRepresentationTransactionDto).body.value.id
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
    transaction: VisualRepresentationTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDoubleVisualRepresentation(transaction, addedTransactions);
    return Promise.resolve();
  }
}
