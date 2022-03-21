import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Compression } from '../dto/compression.dto';
import { Did } from '@tc/transactions/transactions/did/schemas/did.schema';
import { DidSchema } from '@tc/transactions/did-schema/schemas/did-schema.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';

export type TemplateDocument = DidTemplate & mongoose.Document;

/**
 * Describes the values of a template that is used for presentation.
 */
@Schema()
export class DidTemplate extends Did {
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
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DidSchema' })
  @Type(() => DidSchema)
  schemaObject!: DidSchema;
}

/**
 * Template Schema
 */
export const TemplateSchema = SchemaFactory.createForClass(DidTemplate);
