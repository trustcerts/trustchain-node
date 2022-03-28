import { ApiProperty } from '@nestjs/swagger';

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
