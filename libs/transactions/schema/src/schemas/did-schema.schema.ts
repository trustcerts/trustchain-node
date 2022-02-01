import { ApiProperty } from '@nestjs/swagger';
import { Did } from '@shared/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Schema as MongoSchema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type SchemaDocument = DidSchema & Document;

/**
 * Describes the values of a schema that is used for presentation.
 */
@MongoSchema()
export class DidSchema extends Did {
  /**
   * Value of the schema.
   */
  @ApiProperty({ description: 'value of the schema' })
  @Prop()
  schema!: string;
}

/**
 * Schema Schema
 */
export const SchemaSchema = SchemaFactory.createForClass(DidSchema);
