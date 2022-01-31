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
