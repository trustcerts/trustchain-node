import { IVerificationRelationships } from '../dto/did.transaction.dto';
import { Prop } from '@nestjs/mongoose';

/**
 * Entity that describes how verification relations from dids are stored in the database.
 */
export class VerificationRelation {
  /**
   * Name of the method for which the key can be used like authentication or assertion.
   */
  @Prop({ length: 20 })
  method!: keyof IVerificationRelationships;

  /**
   * Unique id of a key.
   */
  @Prop()
  keyIds!: string[];
}
