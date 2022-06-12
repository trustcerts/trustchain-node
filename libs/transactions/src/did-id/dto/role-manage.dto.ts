import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from '@tc/transactions/transactions/did/dto/did-manage.dto';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { IsArray, IsOptional } from 'class-validator';

/**
 * Manger class for the roles.
 */
export class RoleManage extends DidManage<DidRoles> {
  /**
   * Id that should be removed from the list.
   */
  @ApiProperty({
    description: 'roles that should be added to the did',
    example: [DidRoles.Client],
    enum: DidRoles,
    enumName: 'DidRoles',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  add?: DidRoles[];
}
