import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { DidTemplateResolver } from '@trustcerts/did-template';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { TemplateCachedService } from '@tc/transactions/did-template/cached/template-cached.service';
import { TemplateTransactionDto } from '../dto/template.transaction.dto';
import { TransactionCheck } from '@tc/transactions/transactions/transaction-check.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Validates a template before it gets into a block.
 */
@Injectable()
export class TemplateTransactionCheckService extends TransactionCheck<DidTemplateResolver> {
  /**
   * Injects required services
   * @param blockCheckService
   * @param templateCachedService
   */
  constructor(
    protected readonly blockCheckService: BlockCheckService,
    protected readonly templateCachedService: TemplateCachedService,
    protected readonly didCachedService: DidIdCachedService,
    @Inject('winston') logger: Logger,
  ) {
    super(blockCheckService, templateCachedService, didCachedService, logger);
  }

  /**
   * Type of the transaction
   * @returns
   */
  protected getType(): TransactionType {
    return TransactionType.Template;
  }

  /**
   * Returns the identifier that is allowed to make these kind of transactions.
   * @returns
   */
  protected getIdentifier(): DidRoles {
    return DidRoles.Client;
  }

  /**
   * Checks if template is already in the list.
   * @param newTransaction
   * @param addedTransactions
   */
  public checkDoubleTemplate(
    newTransaction: TemplateTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction) => {
      if (
        transaction.body.type === TransactionType.Template &&
        newTransaction.body.value.template ===
          (transaction as TemplateTransactionDto).body.value.template &&
        newTransaction.body.value.id ===
          (transaction as TemplateTransactionDto).body.value.id
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
    transaction: TemplateTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDoubleTemplate(transaction, addedTransactions);
    return Promise.resolve();
  }
}
