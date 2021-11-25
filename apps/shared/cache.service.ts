import { SignatureContent } from '@trustcerts/sdk';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Base service to interact with cached transactions from the database.
 */
export class CachedService {
  /**
   * Returns the values of the transaction that are used generate a signature of a transaction.
   * @param transaction
   */
  public getValues(transaction: TransactionDto): SignatureContent {
    return {
      date: transaction.body.date,
      value: transaction.body.value,
      type: transaction.body.type,
    };
  }
}
