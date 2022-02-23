import { ApiProperty } from '@nestjs/swagger';
import {
  IDENTIFIER_LENGTH_MAX,
  IDENTIFIER_LENGTH_MIN,
} from '@tc/p2-p/connect.const';
import { IsString, Length } from 'class-validator';

/**
 * Describes the values that are between validators to determine the one that builds up the connection.
 */
export class ConnectDto {
  /**
   * Own identifier. Required for the comparision.
   */
  @IsString()
  @ApiProperty({ description: 'Own identifier' })
  @Length(IDENTIFIER_LENGTH_MIN, IDENTIFIER_LENGTH_MAX, {
    message: `Identifier length must be between ${IDENTIFIER_LENGTH_MIN} and ${IDENTIFIER_LENGTH_MAX}`,
  })
  identifier!: string;
  /**
   * Own peer so the other node can connect to it.
   */
  @IsString()
  @ApiProperty({ description: 'Own peer.' })
  peer!: string;
}
