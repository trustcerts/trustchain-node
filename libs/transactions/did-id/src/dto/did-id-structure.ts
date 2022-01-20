import { DidStructure } from '@shared/did/dto/did-structure';
import { RoleManage } from './role-manage';
import { ServiceMange } from './service-mange';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { VerificationMethod } from './verification-method';
import { VerificationRelationshipManage } from './verification-relationship-manage';
import { VerificationRelationships } from './VerificationRelationships';

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
  @ValidateNested()
  @Type(() => RoleManage)
  role?: RoleManage;

  /**
   * public keys that are registered in the did document.
   */
  @ValidateNested()
  @Type(() => VerificationMethod)
  verificationMethod?: VerificationMethod;

  /**
   * Services that should be connected with the did.
   */
  @ValidateNested()
  @Type(() => ServiceMange)
  service?: ServiceMange;

  /**
   * Ids of the key that are used of authentication.
   */
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  authentication?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of assertion.
   */
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  assertionMethod?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of key agreement.
   */
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  keyAgreement?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of updating a did.
   */
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  modification?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of capability delegation.
   */
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  capabilityDelegation?: VerificationRelationshipManage;

  /**
   * Ids of the key that are used of capability invocation.
   */
  @ValidateNested()
  @Type(() => VerificationRelationshipManage)
  capabilityInvocation?: VerificationRelationshipManage;
}
