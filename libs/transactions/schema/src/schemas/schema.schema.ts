import { ApiProperty } from '@nestjs/swagger';
import { Did } from '@apps/shared/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Schema as MongoSchema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type SchemaDocument = Schema & Document;

/**
 * Describes the values of a schema that is used for presentation.
 */
@MongoSchema()
export class Schema extends Did {
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
export const SchemaSchema = SchemaFactory.createForClass(Schema);
