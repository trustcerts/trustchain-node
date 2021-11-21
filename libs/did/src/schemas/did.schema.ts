import * as mongoose from 'mongoose';
import { IsString } from 'class-validator';
import { Key } from '@tc/did/schemas/key.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleManageAddEnum } from '@tc/did/constants';
import { Service } from '@tc/did/schemas/service.schema';
import { VerificationRelation } from './verification-relation.schema';

/**
 * Did as a Document.
 */
export type DidDocument = Did & Document;

/**
 * Describes an entity in form of a did object that can be connected with different values.
 */
@Schema()
export class Did {
  /**
   * DID Subject, only including the id of the document since method is defined by the system.
   * https://www.w3.org/TR/did-core/#did-subject
   */
  @IsString()
  @Prop({ index: true, length: 50, unique: true })
  id!: string;

  /**
   * Controllers are authorized to make changes to the document.
   * https://www.w3.org/TR/did-core/#control
   */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Did' }] })
  controllers!: Did[];

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
  roles!: RoleManageAddEnum[];
}

/**
 * Did Schema
 */
export const DidSchema = SchemaFactory.createForClass(Did);
