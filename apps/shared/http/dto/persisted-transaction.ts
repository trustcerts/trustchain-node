import { ApiProperty } from '@nestjs/swagger';
import { PersistedBlock } from '@tc/blockchain/block/persisted-block.interface';
import { PersistedTransactionMetaData } from './persisted-transaction-meta-data';
import { Type } from 'class-transformer';

/**
 * Interface that describes information of a persisted transaction.
 */

export class PersistedTransaction {
  /**
   * Information about the transaction.
   */
  @ApiProperty()
  transaction!: PersistedTransactionMetaData;
  /**
   * Information about the block where the transaction got persisted.
   */
  @ApiProperty()
  @Type(() => PersistedBlock)
  block!: PersistedBlock;
}
