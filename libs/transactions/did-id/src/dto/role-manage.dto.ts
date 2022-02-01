import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from '@shared/did/dto/did-manage.dto';
import { IsArray, IsOptional } from 'class-validator';
import { RoleManageAddEnum } from '@tc/did-id/constants';

/**
 * Manger class for the roles.pa
 */
export class RoleManage extends DidManage<RoleManageAddEnum> {
  /**
   * Id that should be removed from the list.
   */
  @ApiProperty({
    description: 'roles that should be added to the did',
    example: [RoleManageAddEnum.Client],
    enum: RoleManageAddEnum,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  add?: RoleManageAddEnum[];
}
