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
  /**
   * Used curve, used with elliptic curves.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  crv?: string;
  /**
   * Private exponent of an rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  d?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  dp?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  dq?: string;
  /**
   * used for a symmetric key
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  k?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  p?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  q?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  qi?: string;
  /**
   * coordinate of a position for elliptic curves
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  x?: string;
  /**
   * coordinate of a position for elliptic curves
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  y?: string;
}
