import { ApiProperty } from '@nestjs/swagger';
import { DidStructure } from '@tc/transactions/transactions/did/dto/did-structure.dto';
import { RoleManage } from './role-manage.dto';
import { ServiceMange } from './service-mange.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { VerificationMethod } from './verification-method.dto';
import { VerificationRelationshipManage } from './verification-relationship-manage.dto';
import { VerificationRelationships } from './verification-relationships.dto';

/**
 * Body structure of a did transaction.
 */

export class DidIdStructure
  extends DidStructure
  implements VerificationRelationships
{
  /**
   * Roles that are assigned to a did.
   */
  @ApiProperty()
  @ValidateNested()
  @Type(() => RoleManage)
  role?: RoleManage;

  /**
   * public keys that are registered in the did document.
   */
  @ApiProperty()
  @ValidateNested()
  @Type(() => VerificationMethod)
  verificationMethod?: VerificationMethod;

  /**
   * Services that should be connected with the did.
   */
  @ApiProperty()
  @ValidateNested()
  @Type(() => ServiceMange)
  service?: ServiceMange;

  /**
   * Ids of the key that are used of authentication.
   */
  @ApiProperty()
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  authentication?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of assertion.
   */
  @ApiProperty()
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  assertionMethod?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of key agreement.
   */
  @ApiProperty()
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  keyAgreement?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of updating a did.
   */
  @ApiProperty()
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  modification?: VerificationRelationshipManage;
}
