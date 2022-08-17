import { DidTransactionDto } from '@tc/transactions/transactions/did/dto/did.transaction.dto';
import { StatusListTransactionBody } from './status-list-transactionbody.dto';

/**
 * Class to handle statuslists
 */
export class StatusListTransactionDto extends DidTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: StatusListTransactionBody;
}
