import { ApiProperty } from '@nestjs/swagger';
import { DidPublicKeyType } from '@tc/transactions/did-id/constants';
import { IsString } from 'class-validator';
import { PublicKeyJwkDto } from '@tc/transactions/did-id/dto/public-key-jwk.dto';
import { Type } from 'class-transformer';

/**
 * Definition of the key.
 */

export class DidPublicKey {
  /**
   * Unique identifier of a did
   */
  @ApiProperty({ description: 'unique identifier of a key', example: 'key1' })
  @IsString()
  id!: string;

  // TODO validate if there could be multiple controllers
  /**
   * Did that is able to edit the document.
   */
  @ApiProperty({
    description: 'controller of the key',
    example: 'did:example:12345',
  })
  @IsString()
  controller!: string;

  /**
   * Type of the key.
   */
  @ApiProperty({
    description: 'Type of the key',
    example: DidPublicKeyType.RsaVerificationKey2018,
    enum: DidPublicKeyType,
    enumName: 'DidPublicKeyType',
  })
  type!: DidPublicKeyType;

  /**
   * Encoded key value.
   */
  @ApiProperty({
    description: 'encoded key value',
  })
  @Type(() => PublicKeyJwkDto)
  publicKeyJwk!: PublicKeyJwkDto;
}
