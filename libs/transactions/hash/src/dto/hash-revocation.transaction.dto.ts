import { HashRevocationTransactionBody } from './hash-revocation-transaction-body.dto';
import { HashTransactionDto } from './hash.transaction.dto';
import { Type } from 'class-transformer';

/**
 * Datatransferobject for hash transactions.
 */
export class HashRevocationTransactionDto extends HashTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @Type(() => HashRevocationTransactionBody)
  body!: HashRevocationTransactionBody;
}
