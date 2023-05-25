import { Prop } from '@nestjs/mongoose';
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
  @Prop()
  kty?: string;
  /**
   *  The modulus for the RSA public key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  n?: string;
  /**
   * The exponent for the RSA public key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  e?: string;
  /**
   *  The specific cryptographic algorithm used with the key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  alg?: string;
  /**
   * Used curve, used with elliptic curves.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  crv?: string;
  /**
   * Private exponent of an rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  d?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  dp?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  dq?: string;
  /**
   * used for a symmetric key
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  k?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  p?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  q?: string;
  /**
   * used in a rsa private key.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  qi?: string;
  /**
   * coordinate of a position for elliptic curves
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  x?: string;
  /**
   * coordinate of a position for elliptic curves
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Prop()
  y?: string;
}
