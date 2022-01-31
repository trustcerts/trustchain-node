import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Definition of a service.
 */

export class DidService {
  /**
   * Unique identifier of the service.
   */
  @ApiProperty({
    description: 'unique identifier of a service',
    example: 'service1',
  })
  @IsString()
  id!: string;

  /**
   * Name of the service.
   */
  @ApiProperty({ description: 'name of the service', example: 'agentService' })
  @IsString()
  type!: string;

  /**
   * Endpoint of the service.
   */
  @ApiProperty({
    description: 'url to the service',
    example: 'https://example.com',
  })
  @IsString()
  endpoint!: string;
}
