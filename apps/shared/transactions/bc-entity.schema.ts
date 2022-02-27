import { ApiProperty } from '@nestjs/swagger';
import { BlockInfo } from './block-info';
import { Prop, Schema } from '@nestjs/mongoose';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
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
  @ApiProperty({ description: 'Signature of the hash.', type: SignatureInfo })
  @Prop()
  @Type(() => SignatureInfo)
  signatures!: SignatureInfo;

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
