import { DidTransactionDto } from '@shared/did/dto/did.transaction.dto';
import { HashTransactionBody } from './hash-transaction-body.dto';

/**
 * Datatransferobject for hash transactions.
 */
export class HashTransactionDto extends DidTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: HashTransactionBody;
}
