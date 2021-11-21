import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Entity that describes the elements that a node needs to get access to a network.
 */
export class InviteNode {
  /**
   * Unique id that should be used for the did.
   */
  @ApiProperty({ description: 'id of the did' })
  @IsString()
  id!: string;

  /**
   * Secret that is required for authentication.
   */
  @ApiProperty({ description: 'Secret token' })
  @IsString()
  secret!: string;

  /**
   * Endpoint where the secret code was generated
   */
  @ApiProperty({ description: 'Url of the node endpoint' })
  @IsString()
  url!: string;
}
