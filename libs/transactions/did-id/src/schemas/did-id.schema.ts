import { ApiProperty } from '@nestjs/swagger';
import { Did } from '@shared/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Key } from '@tc/did-id/schemas/key.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleManageType } from '@tc/did-id/constants';
import { Service } from '@tc/did-id/schemas/service.schema';
import { VerificationRelation } from './verification-relation.schema';
/**
 * Did as a Document.
 */
export type DidIdDocument = DidId & Document;

/**
 * Describes an entity in form of a did object that can be connected with different values.
 */
@Schema()
export class DidId extends Did {
  /**
   * Verification methods that can be used.
   * https://www.w3.org/TR/did-core/#verification-methods
   */
  @Prop()
  keys!: Key[];

  /**
   * Relationships of a key.
   * https://www.w3.org/TR/did-core/#verification-relationships
   */
  @Prop()
  verificationRelationships!: VerificationRelation[];

  /**
   * Services that can be used
   * https://www.w3.org/TR/did-core/#services
   */
  @Prop()
  services!: Service[];

  /**
   * Roles that are connected with this did, e.g. is this did authorized
   */
  @Prop()
  @ApiProperty({
    description:
      'Roles that are connected with this did, e.g. is this did authorized',
    enum: RoleManageType,
    enumName: 'RoleManageType',
    isArray: true,
  })
  roles!: RoleManageType[];
}

/**
 * Did Schema
 */
export const DidIdSchema = SchemaFactory.createForClass(DidId);
