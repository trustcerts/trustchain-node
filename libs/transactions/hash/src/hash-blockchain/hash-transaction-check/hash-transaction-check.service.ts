import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidHash } from '@tc/hash/schemas/did-hash.schema';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashDidTransactionDto } from '@tc/hash/dto/hash-transaction.dto';
import { Injectable } from '@nestjs/common';
import { RoleManageType } from '@tc/did-id/constants';
import { TransactionCheck } from '@shared/transactions/transaction.check';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
@Injectable()
export class HashTransactionCheckService extends TransactionCheck {
  /**
   * Injects required services
   * @param hashModel
   * @param blockCheckService
   * @param hashCachedService
   */
  constructor(
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
    newTransaction: HashDidTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction: TransactionDto) => {
      if (
        TransactionType.Hash === transaction.body.type &&
        newTransaction.body.value.id ===
          (transaction as HashDidTransactionDto).body.value.id
      ) {
        throw new Error('Double hash creation');
      }
    });
  }

  /**
   * Checks if hash is already in the database.
   * @param transaction
   */
  public async checkDoubleHashDB(transaction: HashDidTransactionDto) {
    const hash = await this.findHash(transaction.body.value.id);
    if (hash) {
      throw new Error(`Hash already signed: ${transaction.body.value.id}`);
    }
  }

  /**
   * Checks if the issuer is authorized to perform this action.
   */
  private async isIssuerAuthorized(transaction: HashDidTransactionDto) {
    // check if the identifier is authorized.
    const issuer = await this.didCachedService.getDidByKey(
      transaction.signature.values[0].identifier,
    );
    if (!issuer.roles.includes(RoleManageType.Client)) {
      throw Error('issuer is not authorized to create hash transactions');
    }
  }

  /**
   * Checks if the hash with the given hash is in the database and is not revoked.
   * @param transaction
   */
  public async checkRevocation(transaction: HashDidTransactionDto) {
    const hash = await this.findHash(transaction.body.value.id);
    if (!hash) {
      throw new Error(`Hash to revoke doesn't exist.`);
    }
    // TODO implement
    // if (hash.revoked !== undefined) {
    //   throw new Error('Hash already revoked.');
    // }
    if (
      !(await this.isIssuer(
        transaction.signature.values[0].identifier,
        hash.signatures.values[0].identifier,
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

  protected getType(): TransactionType {
    return TransactionType.Hash;
  }

  /**
   * Returns the hash based on the hash.
   * @param hash
   */
  protected async findHash(hash: string) {
    return this.cachedService.getById<DidHash>(hash);
  }

  /**
   * Authorized identifier that is able to add this type of transaction.
   */
  protected getIdentifier(): RoleManageType {
    return RoleManageType.Client;
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   */
  getValidation(
    transaction: HashDidTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDoubleHash(
      transaction as HashDidTransactionDto,
      addedTransactions,
    );
    return Promise.resolve();
  }
}
