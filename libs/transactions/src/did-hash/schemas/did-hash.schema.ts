import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type HashDocumentDocument = DidHashDocument & Document;

/**
 * Entity that describes how signed hashes are stored on the database
 */
@Schema()
export class DidHashDocument extends DidDocument {
  /**
   * Hash of the hash to identify it.
   */
  // TODO use variable to define hash length
  @ApiProperty({ description: 'Hash of the file.' })
  id!: string;

  /**
   * Used algorithm for the hash.
   */
  @ApiProperty({ description: 'Used algorithm for the hash.' })
  // TODO calculate length based on the available types
  @Prop({ length: 10 })
  algorithm!: string;

  /**
   * Date when the hash was revoked.
   */
  @ApiProperty({
    description: 'Timestamp when the hash was revoked.',
    required: false,
    example: new Date().toISOString(),
  })
  @Prop({ nullable: true })
  revoked?: Date;
}

/**
 * Hash Schema
 */
export const HashSchema = SchemaFactory.createForClass(DidHashDocument);
