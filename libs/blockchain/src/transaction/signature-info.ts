import { ApiProperty } from '@nestjs/swagger';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { SignatureType } from './signature-type';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

/**
 * Signature information that signed the transaction.
 */

export class SignatureInfo {
  /**
   * Type of the signature procedure.
   */
  @ApiProperty({
    description: 'Type of the signature procedure.',
    enum: SignatureType,
    enumName: 'SignatureType',
  })
  type!: SignatureType;

  /**
   * Signature of the value and the date.
   */
  @ApiProperty({
    description: 'signature of the document values',
    type: [SignatureDto],
  })
  @ValidateNested({ each: true })
  @Type(() => SignatureDto)
  values!: SignatureDto[];
}
