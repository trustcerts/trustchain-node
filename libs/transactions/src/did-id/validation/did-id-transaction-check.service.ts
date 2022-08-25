import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidIdResolver, DidRoles } from '@trustcerts/did';
import { DidIdTransactionDto } from '@tc/transactions/did-id/dto/did-id-transaction.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { TransactionCheck } from '@tc/transactions/transactions/transaction-check.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
@Injectable()
export class DidIdTransactionCheckService extends TransactionCheck<DidIdResolver> {
  /**
   * Injects required services
   * @param blockCheckService
   * @param didCachedService
   */
  constructor(
    protected readonly blockCheckService: BlockCheckService,
    protected readonly didCachedService: DidIdCachedService,
    @Inject('winston') logger: Logger,
  ) {
    super(blockCheckService, didCachedService, didCachedService, logger);
  }

  /**
   * Type of the transaction to pass it to the map of the block check.
   */
  protected getType(): TransactionType {
    return TransactionType.Did;
  }

  /**
   * Authorized identifier that is able to add this type of transaction.
   */
  protected getIdentifier(): DidRoles {
    // TODO depending on the transaction the allowed identifier has to be passed back
    return DidRoles.Validator;
  }

  /**
   * Checks if there is already a transaction that manipulates the did.
   */
  protected checkDouble(
    newTransaction: DidIdTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) {
    addedTransactions.forEach((transaction: TransactionDto) => {
      if (
        [TransactionType.Did].includes(transaction.body.type) &&
        newTransaction.body.value.id ===
          (transaction as DidIdTransactionDto).body.value.id
      ) {
        throw new Error('Double did manipulation');
      }
    });
  }

  /**
   * Checks if the issuer of the transaction is authorized to manipulate the did.
   * @param transaction
   */
  protected async checkAuthorization(transaction: DidIdTransactionDto) {
    // get the id of the did and compare its' level with the signer
    const documentId = transaction.body.value.id;
    const signerId = this.didCachedService.getIdentifierOfKey(
      transaction.signature.values[0].identifier,
    );

    // if document is self signed allow it
    if (documentId === signerId) {
      return Promise.resolve();
    }

    // check if the signer is one level above the did.
    const idRole = await this.didCachedService.getRole(documentId).then(
      (roles) => roles[0],
      () => {
        // seems like did is new, use the role from the transaction
        const roles = transaction.body.value.role?.add;
        if (!roles) {
          throw new Error('no role specified for new did');
        }
        return roles[0];
      },
    );
    const signerRole = await this.didCachedService
      .getRole(signerId)
      .then((roles) => roles[0]);
    // check if the client was signed by a listed controller
    const controllers: string[] = await this.didCachedService
      .getDid(documentId)
      .then(
        (did) => did.controller,
        () => {
          // TODO check the existence of the controllers has to be validated. Possible when the controller is a did on the same ledger or using the did:trust method
          // in case the did is new get the controllers from the transaction
          return transaction.body.value.controller?.add ?? [];
        },
      );
    const found = controllers.find((controller) => controller === signerId);
    if (found) {
      return Promise.resolve();
    }
    // check the hierarchie
    if (
      (idRole === DidRoles.Client && signerRole === DidRoles.Gateway) ||
      (idRole === DidRoles.Gateway && signerRole === DidRoles.Validator) ||
      (idRole === DidRoles.Observer && signerRole === DidRoles.Validator)
    ) {
      return Promise.resolve();
    }
    throw new Error(`not authorized to update did document.`);
  }

  /**
   * Returns a resolved promise if transaction passes all validations.
   * @param transaction
   * @param addedTransactions
   * @protected
   */
  protected async getValidation(
    transaction: DidIdTransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<void> {
    this.checkDouble(transaction, addedTransactions);
    await this.checkAuthorization(transaction);
    // TODO check which elements can be changed. E.g. the controller can not be changed by the did itself, it can only set new keys
    return Promise.resolve();
  }
}
