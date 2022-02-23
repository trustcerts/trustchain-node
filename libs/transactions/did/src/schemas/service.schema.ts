import { Prop } from '@nestjs/mongoose';

/**
 * Entity that describes how services from dids are stored in the database.
 */
export class Service {
  /**
   * Unique identifier of the service, added as fragment
   */
  @Prop({ length: 20 })
  id!: string;

  /**
   * Name of the service.
   */
  @Prop({ length: 20 })
  type!: string;

  /**
   * Url to the endpoint.
   */
  @Prop()
  endpoint!: string;
}
