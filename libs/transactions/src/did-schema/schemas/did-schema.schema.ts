import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SchemaDocumentDocument = DidSchemaDocument & Document;

/**
 * Describes the values of a schema that is used for presentation.
 */
@Schema()
export class DidSchemaDocument extends DidDocument {
  /**
   * Value of the schema.
   */
  @ApiProperty({ description: 'value of the schema' })
  @Prop()
  value!: string;
}

/**
 * Schema Schema
 */
export const SchemaSchema = SchemaFactory.createForClass(DidSchemaDocument);
