import { ApiProperty } from '@nestjs/swagger';
import {
  IDENTIFIER_LENGTH_MAX,
  IDENTIFIER_LENGTH_MIN,
  INVITE_CODE_LENGTH_MAX,
} from '@tc/p2-p/connect.const';
import { Identifier } from '@trustcerts/core';
import {
  IsDefined,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PublicKeyJwkDto } from '@tc/did/dto/public-key-jwk.dto';
import { Type } from 'class-transformer';

/**
 * Dto to add new did on the chain.
 */
export class CreateDidDto {
  /**
   * Identifier that is connected a Client or an gateway.
   */
  @ApiProperty({
    description: 'Identifier that belongs to the public key',
    example: Identifier.generate('id'),
  })
  @IsString()
  @MinLength(IDENTIFIER_LENGTH_MIN)
  @MaxLength(IDENTIFIER_LENGTH_MAX)
  identifier!: string;

  /**
   * Invite code that allows the creation of a certificate that includes the public key of the identifier.
   */
  @ApiProperty({
    description:
      'Invite code that allows the creation of a certificate that includes the public key of the identifier.',
    example: 'cryptoSecretKey',
  })
  @IsString()
  @MaxLength(INVITE_CODE_LENGTH_MAX)
  secret!: string;

  // TODO allow to pass multiple keys to build up the did doc?
  // TODO use @ValidateIf to make base68key as an alternative
  /**
   * Value of the public key as a json web key.
   */
  @ApiProperty({ description: 'Value of the public key as a json web key.' })
  @Type(() => PublicKeyJwkDto)
  @IsDefined()
  @ValidateNested()
  publicKey!: PublicKeyJwkDto;
}
