import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { Hash, HashDocument } from '../../../schemas/hash.schema';
import { HashCachedService } from '../../../hash-cached/hash-cached.service';
import { HashRevocationTransactionDto } from '@tc/hash/dto/hash-revocation.transaction.dto';
import { HashTransactionCheckService } from '../hash-transaction-check.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
@Injectable()
export class HashRevocationTransactionCheckService extends HashTransactionCheckService {
  /**
   * Injects required services
   * @param didCachedService
   * @param hashRepository
   * @param blockCheckService
   * @param hashCachedService
   */
  constructor(
    @InjectModel(Hash.name)
    protected hashModel: Model<HashDocument>,
    protected readonly blockCheckService: BlockCheckService,
    protected readonly hashCachedService: HashCachedService,
    protected readonly didCachedService: DidCachedService,
  ) {
    super(hashModel, blockCheckService, hashCachedService, didCachedService);
  }

  /**
   * Type of the transaction to pass it to the map of the block check.
   */
  protected getType(): TransactionType {
    return TransactionType.HashRevocation;
  }

  /**
   * Checks if the hash with the given hash is in the database and is not revoked.
   * @param transaction
   */
  public async checkRevocation(transaction: HashRevocationTransactionDto) {
    const hash = await this.findHash(transaction.body.value.hash);
    if (!hash) {
      throw new Error(`Hash to revoke doesn't exist.`);
    }
    if (hash.revokedAt !== undefined) {
      throw new Error('Hash already revoked.');
    }
    if (
      !(await this.isIssuer(
        transaction.signature.values[0].identifier,
        hash.signature[0].identifier,
      ))
    ) {
      throw new Error('Only the original issuer can revoke the hash.');
    }
    return;
  }

  /**
   * Checks if the did is authorized to revoke the hash.
   * @param transactionIssuerId
   * @param hashIssuerId
   */
  private async isIssuer(transactionIssuerId: string, hashIssuerId: string) {
    const didTransaction = await this.didCachedService.getDidByKey(
      transactionIssuerId,
    );
    // TODO validate if the controller is allowed to revoke a hash.
    const didHash = await this.didCachedService.getDidByKey(hashIssuerId);
    return didTransaction.id === didHash.id;
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   */
  async getValidation(
    transaction: TransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    await super.getValidation(transaction, addedTransactions);
    return this.checkRevocation(transaction as HashRevocationTransactionDto);
  }
}
