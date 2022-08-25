import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from '@tc/transactions/transactions/did/dto/did-manage.dto';
import { DidPublicKey } from '../schemas/key.schema';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Implements the Mange keys for the public Keys of a did document.
 */
export class VerificationMethod extends DidManage<DidPublicKey> {
  /**
   * List of public keys that should be added to the did document.
   */
  @ApiProperty({
    description:
      'List of public keys that should be added to the did document.',
    type: [DidPublicKey],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => DidPublicKey)
  add?: DidPublicKey[];
}
