import { ApiProperty } from '@nestjs/swagger';
import { Compression } from '../dto/compression.dto';
import { DidDocument } from '@tc/transactions/transactions/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TemplateDocumentDocument = DidTemplateDocument & Document;

/**
 * Describes the values of a template that is used for presentation.
 */
@Schema()
export class DidTemplateDocument extends DidDocument {
  /**
   * Information about the used compression.
   */
  @Prop()
  @ApiProperty({ description: 'information about the compression' })
  compression!: Compression;

  /**
   * Value of the template.
   */
  @ApiProperty({ description: 'value of the template' })
  template!: string;

  /**
   * Value of the template.
   */
  @ApiProperty({ description: 'schema of the input' })
  schemaId!: string;
}

/**
 * Template Schema
 */
export const TemplateSchema = SchemaFactory.createForClass(DidTemplateDocument);
