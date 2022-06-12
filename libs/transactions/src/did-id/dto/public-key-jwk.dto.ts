import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
/**
 * Describes a json web key object.
 */
export class PublicKeyJwkDto implements JsonWebKey {
  /**
   *  The family of cryptographic algorithms used with the key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  kty?: string;
  /**
   *  The modulus for the RSA public key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  n?: string;
  /**
   * The exponent for the RSA public key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  e?: string;
  /**
   *  The specific cryptographic algorithm used with the key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  alg?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  crv?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  d?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  dp?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  dq?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  k?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  p?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  qi?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  x?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  y?: string;
}
