import { ApiProperty } from '@nestjs/swagger';
import { BcEntity } from 'libs/transactions/bc-entity.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type HashDocument = Hash & Document;

/**
 * Entity that describes how signed hashes are stored on the database
 */
@Schema()
export class Hash extends BcEntity {
  /**
   * Hash of the hash to identify it.
   */
  // TODO use variable to define hash length
  @Prop({ length: 64, index: true, unique: true })
  @ApiProperty({ description: 'Hash of the file.' })
  hash!: string;

  /**
   * Used algorithm for the hash.
   */
  @ApiProperty({ description: 'Used algorithm for the hash.' })
  // TODO calculate length based on the available types
  @Prop({ length: 10 })
  hashAlgorithm!: string;

  /**
   * Date when the hash was signed.
   */
  @ApiProperty({
    description: 'Timestamp when the hash was signed.',
    example: new Date().toISOString(),
  })
  @Prop()
  createdAt!: string;

  /**
   * Date when the hash was revoked.
   */
  @ApiProperty({
    description: 'Timestamp when the hash was revoked.',
    required: false,
    example: new Date().toISOString(),
  })
  @Prop({ nullable: true })
  revokedAt?: Date;
}

/**
 * Hash Schema
 */
export const HashSchema = SchemaFactory.createForClass(Hash);
