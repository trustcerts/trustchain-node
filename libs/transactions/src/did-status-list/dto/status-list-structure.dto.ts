import { ApiProperty } from '@nestjs/swagger';
import { DidStructure } from '@tc/transactions/transactions/did/dto/did-structure.dto';
import { IsEnum, IsString, Matches } from 'class-validator';
import { STATUSLIST_NAME } from '../constants';
import { StatusPurpose } from './status-purpose.dto';
import { getDid } from '@shared/helpers';

/**
 * Describes the value of a statuslist.
 */

export class DidStatusListStructure extends DidStructure {
  /**
   * Unique identifier.
   */
  @ApiProperty({
    // TODO set correct example
    example: '123456789ABCDEFGHJKLMN',
    description: 'unique identifier of a statuslist',
  })
  @Matches(getDid(STATUSLIST_NAME))
  @IsString()
  id!: string;

  /**
   * Encoded bitstring
   */
  @ApiProperty({ description: 'enocded bitstring' })
  @IsString()
  encodedList?: string;

  /**
   * purpose of the list
   */
  @ApiProperty({
    description: 'purpose of the list',
    enum: StatusPurpose,
    enumName: 'StatusPurpose',
  })
  @IsEnum(StatusPurpose)
  statusPurpose?: StatusPurpose;
}
