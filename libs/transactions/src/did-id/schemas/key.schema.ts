import { Prop } from '@nestjs/mongoose';
import { PublicKeyJwkDto } from '@tc/transactions/did-id/dto/public-key-jwk.dto';

/**
 * Entity that describes how keys from dids are stored in the database.
 */
export class Key {
  /**
   * Identifier of the key, added as fragment.
   */
  @Prop({ length: 200 })
  id!: string;

  /**
   * Value of the encoded key.
   */
  @Prop()
  publicKeyJwk!: PublicKeyJwkDto;

  /**
   * entity that is allowed to change the did document.
   */
  @Prop()
  controller!: string;

  /**
   * Type of the verification method based on https://w3c.github.io/did-spec-registries/#verification-method-types
   */
  @Prop()
  type!: string;
}
