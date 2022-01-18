import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { Hash, HashDocument } from '@tc/hash/schemas/hash.schema';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashCreationTransactionDto } from '@tc/hash/dto/hash-creation.transaction.dto';
import { HashTransactionCheckService } from '@tc/hash/hash-blockchain/hash-transaction-check/hash-transaction-check.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { RoleManageAddEnum } from '@tc/did/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
@Injectable()
export class HashSignTransactionCheckService extends HashTransactionCheckService {
  /**
   * Injects required services
   * @param hashRepository
   * @param blockCheckService
   * @param hashCachedService
   */
  constructor(
    protected readonly didCachedService: DidCachedService,
    @InjectModel(Hash.name)
    protected hashModel: Model<HashDocument>,
    protected readonly blockCheckService: BlockCheckService,
    protected readonly hashCachedService: HashCachedService,
  ) {
    super(hashModel, blockCheckService, hashCachedService, didCachedService);
  }

  /**
   * Type of the transaction to pass it to the map of the block check.
   */
  protected getType(): TransactionType {
    return TransactionType.HashCreation;
  }

  /**
   * Checks if hash is already in the database.
   * @param transaction
   */
  public async checkDoubleHashDB(transaction: HashCreationTransactionDto) {
    const hash = await this.findHash(transaction.body.value.hash);
    if (hash) {
      throw new Error(`Hash already signed: ${transaction.body.value.hash}`);
    }
  }

  /**
   * Checks if the issuer is authorized to perform this action.
   */
  private async isIssuerAuthorized(transaction: HashCreationTransactionDto) {
    // check if the identifier is authorized.
    const issuer = await this.didCachedService.getDidByKey(
      transaction.signature.values[0].identifier,
    );
    if (!issuer.roles.includes(RoleManageAddEnum.Client)) {
      throw Error('issuer is not authorized to create hash transactions');
    }
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   */
  async getValidation(
    transaction: HashCreationTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    await super.getValidation(transaction, addedTransactions);
    await this.checkDoubleHashDB(transaction as HashCreationTransactionDto);
    await this.isIssuerAuthorized(transaction);
  }
}
