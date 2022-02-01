import { HashStructure } from './hash-structure.dto';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body.dto';
import { Type } from 'class-transformer';

/**
 * Body of a hash transaction.
 */

export class HashTransactionBody extends TransactionBody {
  /**
   * Values of a hash transaction.
   */
  @Type(() => HashStructure)
  value!: HashStructure;
}
