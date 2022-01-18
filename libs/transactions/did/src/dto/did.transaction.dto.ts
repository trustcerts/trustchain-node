import { ApiProperty } from '@nestjs/swagger';
import { DidPublicKeyTypeEnum, RoleManageAddEnum } from '@tc/did/constants';
import { DidStructure } from '@apps/shared/did/dto/did.transaction.dto';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PublicKeyJwkDto } from '@tc/did/dto/public-key-jwk.dto';
import {
  SignatureInfo,
  SignatureType,
  TransactionBody,
  TransactionDto,
} from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Definition of the key.
 */
export class DidPublicKey {
  /**
   * Unique identifier of a did
   */
  @ApiProperty({ description: 'unique identifier of a key', example: 'key1' })
  @IsString()
  id!: string;

  // TODO validate if there could be multiple controllers
  /**
   * Did that is able to edit the document.
   */
  @ApiProperty({
    description: 'controller of the key',
    example: 'did:example:12345',
  })
  @IsString()
  controller!: string;

  /**
   * Type of the key.
   */
  @ApiProperty({
    description: 'Type of the key',
    example: DidPublicKeyTypeEnum.RsaVerificationKey2018,
    enum: DidPublicKeyTypeEnum,
  })
  type!: DidPublicKeyTypeEnum;

  /**
   * Encoded key value.
   */
  @ApiProperty({
    description: 'encoded key value',
  })
  @Type(() => PublicKeyJwkDto)
  publicKeyJwk!: PublicKeyJwkDto;
}

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

/**
 * Defines the keys to change elements of did documents that include
 */
export class DidManage {
  /**
   * Includes rules to add a list of objects that will be appended.
   */
  add?: any[];

  /**
   * List of did that should be removed
   */
  remove?: string[];
}

/**
 * Implements the Mange keys for the public Keys of a did document.
 */
class VerificationMethod extends DidManage {
  /**
   * List of public keys that should be added to the did document.
   */
  @ApiProperty({
    description:
      'List of public keys that should be added to the did document.',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => DidPublicKey)
  add?: DidPublicKey[];
}

/**
 * Implements the Mange for the services of a did document.
 */
class ServiceMange extends DidManage {
  /**
   * List of services that should be added to the did document.
   */
  @ApiProperty({
    description: 'List of services that should be added to the did document.',
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => DidService)
  add?: DidService[];
}

/**
 * Implements the Mange for the authentication keys of a did document.
 */
class VerificationRelationshipManage extends DidManage {
  /**
   * Id that should be removed from the list.
   */
  @ApiProperty({
    description: 'id that should be removed from the list',
    example: ['element1'],
  })
  @IsOptional()
  @IsString({ each: true })
  add?: string[];
}

/**
 * Manger class for the roles.pa
 */
class RoleManage extends DidManage {
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

/**
 * Interfaces of all verification relationships.
 */
export interface IVerificationRelationships {
  /**
   * keys that are used for authentication
   */
  authentication?: any;
  /**
   * keys that are used for assertion
   */
  assertionMethod?: any;
  // keyAgreement?: any;
  /**
   * keys that are used for updating the did document.
   */
  modification?: any;
  // capabilityDelegation?: any;
  // capabilityInvocation?: any;
}

/**
 * Relationships of a verification key.
 */
export class VerificationRelationships implements IVerificationRelationships {}

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

/**
 * Body of a did transaction.
 */
export class DidTransactionBody extends TransactionBody {
  /**
   * Elements of the did document.
   */
  @Type(() => DidIdStructure)
  value!: DidIdStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  type!: TransactionType;

  /**
   * Signature of the did document after applying the changes.
   */
  @ApiProperty({
    description: 'signature of the did document after applying the changes',
  })
  @Type(() => SignatureInfo)
  didDocSignature!: SignatureInfo;
}

/**
 * Datatransferobject for did transactions.
 */
export class DidIdTransactionDto extends TransactionDto {
  /**
   * Inits the type and the signature values.
   * @param value
   */
  constructor(value: DidIdStructure, didDocSignature: SignatureInfo) {
    super(TransactionType.Did, value);
    this.body.didDocSignature = didDocSignature;
    this.signature = {
      type: SignatureType.single,
      values: [],
    };
  }

  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @Type(() => DidTransactionBody)
  body!: DidTransactionBody;
}
