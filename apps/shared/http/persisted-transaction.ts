import { ApiProperty } from '@nestjs/swagger';
import { PersistedBlock } from '@tc/blockchain/block/persisted-block.interface';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { Type } from 'class-transformer';

/**
 * Describes the metadata of a persisted transaction.
 */
export class PersistedTransactionMetaData {
  /**
   * hash to identity the transaction.
   */
  @ApiProperty({ example: '1234567890abcdef' })
  hash!: string;

  /**
   * Time after the node persisted the information.
   */
  @ApiProperty({ example: new Date().toISOString() })
  persisted!: string;
}

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
