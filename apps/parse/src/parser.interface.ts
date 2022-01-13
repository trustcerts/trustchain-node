import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Function pointers to interact with a special type of transaction.
 */
export interface Parser {
  /**
   * Function to reset the database.
   */
  reset(): Promise<void>;
  /**
   * Function to parese a new transaction.
   * @param transaction
   */
  parsing(transaction: TransactionDto): Promise<void>;
}
