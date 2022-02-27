import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidId } from '@tc/did-id/schemas/did-id.schema';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { DidIdTransactionDto } from '@tc/did-id/dto/did-id-transaction.dto';
import { Injectable } from '@nestjs/common';
import { RoleManageType } from '@tc/did-id/constants';
import { TransactionCheck } from '@shared/transactions/transaction.check';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
@Injectable()
export class DidIdTransactionCheckService extends TransactionCheck {
  /**
   * Injects required services
   * @param blockCheckService
   * @param didCachedService
   */
  constructor(
    protected readonly blockCheckService: BlockCheckService,
    protected readonly didCachedService: DidIdCachedService,
  ) {
    super(blockCheckService, didCachedService, didCachedService);
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
  protected getIdentifier(): RoleManageType {
    // TODO depending on the transaction the allowed identifier has to be passed back
    return RoleManageType.Validator;
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
    const id = transaction.body.value.id;
    const signerId = this.didCachedService.getIdentifierOfKey(
      transaction.signature.values[0].identifier,
    );

    // if document is self signed allow it
    if (id === signerId) {
      return Promise.resolve();
    }

    // check if the signer is one level above the did.
    const idRole = await this.didCachedService.getRole(id).then(
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
    const controllers: DidId[] = await this.didCachedService
      .getDid(id, 'controllers')
      .then(
        (did) => did.controllers,
        () => {
          // in case the did is new get the controllers from the transaction
          const controllerDids = transaction.body.value.controller?.add;
          if (controllerDids) {
            return Promise.all(
              controllerDids.map((controllerDid) =>
                this.didCachedService.getDid(controllerDid),
              ),
            );
          } else {
            return [];
          }
        },
      );
    console.log('check auth');
    console.log(controllers);
    const found = controllers.find((controller) => controller.id === signerId);
    if (found) {
      return Promise.resolve();
    }
    // check the hierarchie
    if (
      (idRole === RoleManageType.Client &&
        signerRole === RoleManageType.Gateway) ||
      (idRole === RoleManageType.Gateway &&
        signerRole === RoleManageType.Validator) ||
      (idRole === RoleManageType.Observer &&
        signerRole === RoleManageType.Validator)
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
