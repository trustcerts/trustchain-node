import { IVerificationRelationships } from '../dto/i-verification-relationships';
import { Prop } from '@nestjs/mongoose';

/**
 * Entity that describes how verification relations from dids are stored in the database.
 */
export class VerificationRelation {
  /**
   * Name of the method for which the key can be used like authentication or assertion.
   */
  // TODO check if type string is correct
  @Prop({ length: 20, type: 'string' })
  method!: keyof IVerificationRelationships;

  /**
   * Unique id of a key.
   */
  @Prop()
  keyIds!: string[];
}
