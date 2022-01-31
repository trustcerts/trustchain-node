import { ApiProperty } from '@nestjs/swagger';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body.dto';
import { TransactionHashValue } from './transaction-hash-value.dto';
import { Type } from 'class-transformer';

/**
 * Body of a hash transaction.
 */

export class HashTransactionBody extends TransactionBody {
  /**
   * Values of a hash transaction.
   */
  @Type(() => TransactionHashValue)
  value!: TransactionHashValue;
}
