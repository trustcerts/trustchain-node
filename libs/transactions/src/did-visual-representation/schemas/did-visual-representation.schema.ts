import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/schemas/did.schema';
import { Document } from 'mongoose';
import { IsArray, ValidateNested } from 'class-validator';
import { Presentation } from '../dto/presentation.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';

export type VisualRepresentationDocumentDocument =
  DidVisualRepresentationDocument & Document;

/**
 * Describes the values of a visualrepresentation that is used for revocation.
 */
@Schema()
export class DidVisualRepresentationDocument extends DidDocument {
  /**
   * array of presentations that belong to the did document.
   */
  @ApiProperty({
    description: 'array of presentations that belong to the did document.',
    type: [Presentation],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Presentation)
  @Prop()
  presentation!: Presentation[];
}

/**
 * VisualRepresentation Schema
 */
export const VisualRepresentationSchema = SchemaFactory.createForClass(
  DidVisualRepresentationDocument,
);
