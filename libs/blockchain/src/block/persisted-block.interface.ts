import { ApiProperty } from '@nestjs/swagger';

/**
 * Includes information about a persisted block that can be added to a transaction.
 */
export class PersistedBlock {
  /**
   * Index of the block.
   */
  @ApiProperty({ example: 69 })
  id!: number;

  /**
   * Timestamp when the block was proposed and later accepted.
   */
  @ApiProperty({ example: new Date().toISOString() })
  createdAt!: string;

  /**
   * Nodes that where included in the process.
   */
  @ApiProperty({
    // TODO use better example values
    example: ['foobar', 'foobar'],
  })
  validators!: string[];
}
