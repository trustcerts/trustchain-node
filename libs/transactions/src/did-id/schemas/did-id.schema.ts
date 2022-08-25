import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/schemas/did.schema';
import { DidPublicKey } from '@tc/transactions/did-id/schemas/key.schema';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { DidService } from '@tc/transactions/did-id/schemas/service.schema';
import { Document } from 'mongoose';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
/**
 * Did as a Document.
 */
export type DidIdDocumentDocument = DidIdDocument & Document;

/**
 * Describes an entity in form of a did object that can be connected with different values.
 */
@Schema()
export class DidIdDocument extends DidDocument {
  /**
   * Verification methods that can be used.
   * https://www.w3.org/TR/did-core/#verification-methods
   */
  @ApiProperty({
    description: 'array of keys that belong to the did document.',
    type: [DidPublicKey],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DidPublicKey)
  @Prop()
  verificationMethod!: DidPublicKey[];

  /**
   * Keys' that are used to prove the identity.
   * https://www.w3.org/TR/did-core/#verification-relationships
   */
  @ApiProperty({ description: 'keys that are used for authentication.' })
  @IsString({ each: true })
  @Prop()
  authentication!: string[];

  /**
   * Keys' that are used to sign credentials.
   * https://www.w3.org/TR/did-core/#verification-relationships
   */
  @ApiProperty({ description: 'keys that are used for assertion.' })
  @IsString({ each: true })
  @Prop()
  assertionMethod!: string[];

  /**
   * Keys' that are used to manipulate this did document.
   * https://www.w3.org/TR/did-core/#verification-relationships
   */
  @ApiProperty({ description: 'keys that are used for modification.' })
  @IsString({ each: true })
  @Prop()
  modification!: string[];

  /**
   * Services that can be used
   * https://www.w3.org/TR/did-core/#services
   */
  @ApiProperty({
    description: 'services that are connected with this did.',
    type: [DidService],
  })
  @IsString({ each: true })
  @Prop()
  service!: DidService[];

  /**
   * Roles that are connected with this did, e.g. is this did authorized
   */
  @ApiProperty({
    description:
      'Roles that are connected with this did, e.g. is this did authorized',
    enum: DidRoles,
    enumName: 'DidRoles',
    isArray: true,
  })
  @Prop()
  role!: DidRoles[];
}

/**
 * Did Schema
 */
export const DidIdSchema = SchemaFactory.createForClass(DidIdDocument);
