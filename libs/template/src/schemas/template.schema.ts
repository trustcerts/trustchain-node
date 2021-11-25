import { ApiProperty } from '@nestjs/swagger';
import { BcEntity } from '@apps/shared/bc-entity.schema';
import { Compression } from '../dto/template.transaction.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TemplateDocument = Template & Document;

/**
 * Describes the values of a template that is used for presentation.
 */
@Schema()
export class Template extends BcEntity {
  /**
   * Unique identifier, normally a did string
   */
  @Prop({ length: 50 })
  @ApiProperty({ description: 'did of the template' })
  id!: string;

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
  @Prop()
  schema!: string;
}

/**
 * Template Schema
 */
export const TemplateSchema = SchemaFactory.createForClass(Template);
