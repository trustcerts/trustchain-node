import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { RoleManageType } from '@tc/transactions/did-id/constants';
import { SchemaCachedService } from '@tc/transactions/did-schema/cached/schema-cached.service';
import { SchemaTransactionDto } from '@tc/transactions/did-schema/dto/schema.transaction.dto';
import { TransactionCheck } from '@tc/transactions/transactions/transaction-check.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import Ajv from 'ajv';

/**
 * Validates a schema before it gets into a block.
 */
@Injectable()
export class SchemaTransactionCheckService extends TransactionCheck {
  /**
   * Ajv instance to validate schemas.
   */
  private ajv: Ajv;

  /**
   * Injects required services
   * @param blockCheckService
   * @param schemaCachedService
   */
  constructor(
    protected readonly blockCheckService: BlockCheckService,
    protected readonly schemaCachedService: SchemaCachedService,
    protected readonly didCachedService: DidIdCachedService,
    @Inject('winston') logger: Logger,
  ) {
    super(blockCheckService, schemaCachedService, didCachedService, logger);
    this.ajv = new Ajv();
  }

  /**
   * Type of the transaction
   * @returns
   */
  protected getType(): TransactionType {
    return TransactionType.Schema;
  }

  /**
   * Returns the identifier that is allowed to make these kind of transactions.
   * @returns
   */
  protected getIdentifier(): RoleManageType {
    return RoleManageType.Client;
  }

  /**
   * Validates if the schema is a json-ld schema that can be used to validate json input.
   */
  public validateSchema(transaction: SchemaTransactionDto) {
    if (!this.ajv.validateSchema(JSON.parse(transaction.body.value.schema!))) {
      throw Error('input does not match with schema');
    }
  }

  /**
   * Checks if schema is already in the list.
   * @param newTransaction
   * @param addedTransactions
   */
  public checkDoubleSchema(
    newTransaction: SchemaTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction) => {
      if (
        // transaction.body.type === TransactionType.Schema &&
        // newTransaction.body.value.schema ===
        //   (transaction as SchemaTransaction).body.value.schema &&
        newTransaction.body.value.id ===
        (transaction as SchemaTransactionDto).body.value.id
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
    transaction: SchemaTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDoubleSchema(transaction, addedTransactions);
    return Promise.resolve();
  }
}
