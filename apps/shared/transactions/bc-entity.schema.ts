import { ApiProperty } from '@nestjs/swagger';
import { BlockInfo } from './block-info';
import { Prop, Schema } from '@nestjs/mongoose';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { Type } from 'class-transformer';

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
