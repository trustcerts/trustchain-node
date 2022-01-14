import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema } from '@nestjs/mongoose';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { Type } from 'class-transformer';

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

/**
 * Base class of parsed information.
 */
@Schema()
export class BcEntity {
  // TODO how to save multi signatures
  /**
   * Signature of the hash.
   */
  @ApiProperty({ description: 'Signature of the hash.', type: [SignatureDto] })
  @Prop()
  @Type(() => SignatureDto)
  signature!: SignatureDto[];

  /**
   * Information about the block.
   */
  @ApiProperty({
    description: 'Blockinformation',
    type: BlockInfo,
  })
  @Prop()
  @Type(() => BlockInfo)
  block!: BlockInfo;
}
