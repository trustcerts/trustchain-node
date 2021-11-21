import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SecurityDocument = Security & Document;

/**
 * Describes the security entity that belongs to a user.
 */
@Schema()
export class Security {
  /**
   * Name of the identifier that belongs to this security rule.
   */
  @Prop({ index: true })
  id!: string;

  /**
   * If true a recaptcha has to be solved to send requests.
   */
  @Prop({ default: false })
  recaptcha!: boolean;

  /**
   * Monthly limit the Client is allowed to send. If it is set to zero there is no limit.
   */
  @Prop({ default: 0 })
  limit!: number;
}

/**
 * Security Schema
 */
export const SecuritySchema = SchemaFactory.createForClass(Security);
