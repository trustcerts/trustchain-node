import { ApiProperty } from '@nestjs/swagger';
import { Did } from '@tc/transactions/transactions/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SchemaDocument = DidSchema & Document;

/**
 * Describes the values of a schema that is used for presentation.
 */
@Schema()
export class DidSchema extends Did {
  /**
   * Value of the schema.
   */
  @ApiProperty({ description: 'value of the schema' })
  @Prop()
  values!: string;
}

/**
 * Schema Schema
 */
export const SchemaSchema = SchemaFactory.createForClass(DidSchema);
