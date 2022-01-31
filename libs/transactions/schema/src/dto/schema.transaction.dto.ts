import { SchemaTransactionBody } from './schema-transaction-body.dto';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Class to handle schemas
 */
export class SchemaTransaction extends TransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: SchemaTransactionBody;
}
