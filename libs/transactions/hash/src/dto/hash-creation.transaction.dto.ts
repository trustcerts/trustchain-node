import { HashCreationTransactionBody } from './hash-creation-transaction-body.dto';
import { HashTransactionDto } from './hash.transaction.dto';

/**
 * Datatransferobject for hash transactions.
 */
export class HashCreationTransactionDto extends HashTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: HashCreationTransactionBody;
}
