import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsString } from 'class-validator';
/**
 * Describes a json web key object.
 */
// TODO add values for a ec key.
// TODO evaluate if JsonWebKey should be implemented.
export class PublicKeyJwkDto {
  /**
   * How the key was meant to be used
   */
  @ApiProperty({
    description: 'How the key was meant to be used',
    example: ['verify'],
  })
  @IsString({ each: true })
  key_ops?: string[] | undefined;

  /**
   *  The family of cryptographic algorithms used with the key.
   */
  @ApiProperty({
    description: 'The family of cryptographic algorithms used with the key.',
    example: ['RSA'],
  })
  @Equals('RSA')
  kty?: string;
  /**
   *  The modulus for the RSA public key.
   */
  @ApiProperty({
    description: 'The modulus for the RSA public key.',
    example:
      'zvbICKrRLlnDWuTXRwWV9nsaiYCaLCNiNF1WmbsWFXHbT9AhyYDbIh_KLI0y5vpYTIfdneRYeNWjkldzZ_J3xZDJ9zUdxHZGXUa9j-NHInmKsYVPDhTYTbTEmDQ2COGKv26klNkyNFKS1Sap8Q7y3jyZQvV4fVd4KynpkJirpDRoDS4jeqPrZKjXQdLxmLBnBiUuD7V2phy5PFBxTsnX6wkZiWJKRRzq6CnavlgeieLgCUrsD6fmmV7B5MtJJ-fdrLxXFXXDaD9d82ZFmM24dqaMkwLvMt22xEaz27WoYftUJJIbYGNec4qTTzacEv_YcYgR8YIXQSpnviXsZ0mqPw',
  })
  @IsString()
  n?: string;
  /**
   * The exponent for the RSA public key.
   */
  @ApiProperty({
    description: 'The exponent for the RSA public key.',
    example: 'AQAB',
  })
  @IsString()
  e?: string;
  /**
   *  The specific cryptographic algorithm used with the key.
   */
  @IsString()
  @Equals('RS256')
  @ApiProperty({
    description: 'The specific cryptographic algorithm used with the key.',
    example: 'RS256',
  })
  alg?: string;
}
