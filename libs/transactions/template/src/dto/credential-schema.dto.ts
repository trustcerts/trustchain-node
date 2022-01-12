import { Prop } from '@nestjs/mongoose';

/**
 * type of property
 */
export class Property {
  /**
   * type of property
   */
  @Prop()
  type!: string;
}
/**
 * Credential Schema
 */
export class CredentialSchema {
  /**
   * information about the type
   */
  @Prop()
  type!: string;
  // @Prop({ type: Property })

  /**
   * extra properties
   */
  properties!: Record<string, Property>;
  /**
   * required
   */
  @Prop()
  required!: string[];
  /**
   * if there are extra properties
   */
  @Prop()
  additionalProperties!: boolean;
}
