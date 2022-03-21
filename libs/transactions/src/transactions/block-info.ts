import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@nestjs/mongoose';

/**
 * Information of the block where the transaction got parsed.
 */

export class BlockInfo {
  /**
   * Number for the block.
   */
  @ApiProperty({
    description: 'id of the block',
    example: 69,
  })
  @Prop()
  id!: number;
  /**
   * Time when the block was got persisted.
   */
  @ApiProperty({
    description: 'time when the block got persisted',
    example: new Date().toISOString(),
  })
  @Prop()
  createdAt!: string;

  /**
   * Timestamp when the transaction was persisted in the other blockchain.
   */
  @ApiProperty({
    description:
      'time when the transaction was persisted in an imported blockchain',
    example: new Date().toISOString(),
    required: false,
  })
  @Prop()
  imported?: string;
}
