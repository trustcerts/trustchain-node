import { ApiProperty } from '@nestjs/swagger';
import { Compression } from './compression.dto';
import { DidStructure } from '@apps/shared/did/dto/did-structure.dto';
import { IsString, Matches } from 'class-validator';
import { TEMPLATE_NAME } from '../constants';
import { Type } from 'class-transformer';
import { getDid } from '@shared/helpers';

/**
 * Describes the value of a template.
 */

export class TemplateStructure extends DidStructure {
  /**
   * Unique identifier.
   */
  @ApiProperty({
    // TODO set correct example
    example: '123456789ABCDEFGHJKLMN',
    description: 'unique identifier of a template',
  })
  @Matches(getDid(TEMPLATE_NAME))
  @IsString()
  id!: string;

  /**
   * template that should be used. Will be stored in the file system so the size only matters when sending the template
   */
  @ApiProperty({
    description: 'template that should be used.',
  })
  @IsString()
  template!: string;

  /**
   * did of the schema the template is based on
   */
  @ApiProperty({
    description: 'did of the schema the template is based on',
  })
  @IsString()
  schemaId!: string;

  /**
   * Information about the used compression algorithm.
   */
  @Type(() => Compression)
  compression!: Compression;
}
