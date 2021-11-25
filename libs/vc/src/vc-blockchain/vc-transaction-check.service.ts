import { RoleManageAddEnum } from '@tc/did/constants';
import { TransactionCheck } from '@shared/transaction.check';

/**
 * Service that implements required function to validate a transaction of a specific type.
 */
export abstract class VcTransactionCheckService extends TransactionCheck {
  /**
   * Authorized identifier that is able to add this type of transaction.
   */
  protected getIdentifier(): RoleManageAddEnum {
    return RoleManageAddEnum.Gateway;
  }
}
