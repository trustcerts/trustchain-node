import { ApiProperty } from '@nestjs/swagger';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { Document } from 'mongoose';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type InviteRequestDocument = InviteRequest & Document;

/**
 * Entity that describes how invites are stored in the database.
 */
@Schema()
export class InviteRequest {
  /**
   * Unique identifier of a new did.
   */
  @ApiProperty({
    description: 'Unique identifier that is used for the new did.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Prop({ length: 50 })
  id?: string;

  /**
   * Secret/Invite code.
   */
  @ApiProperty({
    description: 'Secret that is used for authentication',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Prop({ nullable: true })
  secret?: string;

  // TODO implement more information like an ipfs link to a detailed information about the user
  /**
   * Identifier for the new did.
   */
  @ApiProperty({
    description:
      'Unique identifier that will be stored to identify the did with a human readable name.',
    example: 'Client-north',
  })
  @IsString()
  @Prop()
  name!: string;

  /**
   * Describes for what type of role in the network the secret is allowed to be used.
   */
  @ApiProperty({
    description:
      'Describes for what type of role in the network the secret is allowed to be used',
  })
  @IsEnum(DidRoles)
  @Prop({ length: 20 })
  role!: DidRoles;

  /**
   * If set to true a new secret will be set for an existing entry
   */
  @ApiProperty({
    description:
      'If set to true a new secret will be set for an existing entry',
  })
  force?: boolean;
}

/**
 * Invite Request Schema
 */
export const InviteRequestSchema = SchemaFactory.createForClass(InviteRequest);
