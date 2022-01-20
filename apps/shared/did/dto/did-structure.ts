import { ApiProperty } from '@nestjs/swagger';
import { ControllerManage } from './controller-manage';
import { DID_ID_NAME } from '@tc/did-id/constants';
import { IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { getDid } from '@shared/helpers';

/**
 * Body structure of a did transaction.
 */

export class DidStructure {
  /**
   * Unique identifier.
   */
  @ApiProperty({
    // TODO set correct example
    example: '123456789ABCDEFGHJKLMN',
    description: 'unique identifier of a did',
  })
  @Matches(getDid(DID_ID_NAME))
  @IsString()
  id!: string;

  /**
   * Did that controls this did.
   */
  @ValidateNested()
  @Type(() => ControllerManage)
  controller?: ControllerManage;
}
