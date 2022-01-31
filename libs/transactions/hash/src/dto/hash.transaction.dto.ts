import { HashTransactionBody } from './hash-transaction-body.dto';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Datatransferobject for hash transactions.
 */
export class HashTransactionDto extends TransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: HashTransactionBody;
}
