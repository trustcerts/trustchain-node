import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';

/**
 * Entity that describes how services from dids are stored in the database.
 */
export class DidService {
  /**
   * Unique identifier of the service, added as fragment
   */
  @ApiProperty({
    description: 'unique identifier of a service',
    example: 'service1',
  })
  @IsString()
  @Prop({ length: 20 })
  id!: string;

  /**
   * Name of the service.
   */
  @ApiProperty({ description: 'name of the service', example: 'agentService' })
  @IsString()
  @Prop({ length: 20 })
  type!: string;

  /**
   * Url to the endpoint.
   */
  @ApiProperty({
    description: 'url to the service',
    example: 'https://example.com',
  })
  @IsString()
  @Prop()
  endpoint!: string;
}
