import { ApiProperty } from '@nestjs/swagger';
import { DidPublicKeyType } from '../constants';
import { IsEnum, IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';
import { PublicKeyJwkDto } from '@tc/transactions/did-id/dto/public-key-jwk.dto';
import { Type } from 'class-transformer';

/**
 * Entity that describes how keys from dids are stored in the database.
 */
export class DidPublicKey {
  /**
   * Identifier of the key, added as fragment.
   */
  @ApiProperty({ description: 'unique identifier of a key', example: 'key1' })
  @IsString()
  @Prop({ length: 200 })
  id!: string;

  /**
   * Value of the encoded key.
   */
  @ApiProperty({
    description: 'encoded key value',
  })
  @Type(() => PublicKeyJwkDto)
  // @Prop()
  publicKeyJwk!: PublicKeyJwkDto;

  /**
   * entity that is allowed to change the did document.
   */
  @ApiProperty({
    description: 'controller of the key',
    example: 'did:example:12345',
  })
  @IsString()
  // @Prop()
  controller!: string;

  /**
   * Type of the verification method based on https://w3c.github.io/did-spec-registries/#verification-method-types
   */
  @ApiProperty({
    description: 'Type of the key',
    example: DidPublicKeyType.RsaVerificationKey2018,
    enum: DidPublicKeyType,
    enumName: 'DidPublicKeyType',
  })
  @IsEnum(DidPublicKeyType)
  // @Prop({ enum: DidPublicKeyType })
  type!: DidPublicKeyType;
}
