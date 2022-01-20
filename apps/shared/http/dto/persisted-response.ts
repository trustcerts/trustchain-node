import { ApiProperty } from '@nestjs/swagger';
import { PersistedTransaction } from './persisted-transaction';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { Type } from 'class-transformer';

/**
 * Interface that describes the response of the persistence of a transaction.
 */

export class PersistedResponse {
  /**
   * Transaction that got persisted.
   */
  transaction!: TransactionDto;

  /**
   * Additional information about persistence.
   */
  @ApiProperty({ description: 'additional metadata to the transaction' })
  @Type(() => PersistedTransaction)
  metaData!: PersistedTransaction;
}
