import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from '@shared/did/dto/did-manage.dto';
import { IsArray, IsOptional } from 'class-validator';
import { RoleManageType } from '@tc/did-id/constants';

/**
 * Manger class for the roles.pa
 */
export class RoleManage extends DidManage<RoleManageType> {
  /**
   * Id that should be removed from the list.
   */
  @ApiProperty({
    description: 'roles that should be added to the did',
    example: [RoleManageType.Client],
    enum: RoleManageType,
    enumName: 'RoleManageType',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  add?: RoleManageType[];
}
