import { ApiProperty } from '@nestjs/swagger';
import { Compression } from './compression.dto';
import { IsString, Matches } from 'class-validator';
import { TEMPLATE_NAME } from '../constants';
import { Type } from 'class-transformer';
import { getDid } from '@shared/helpers';

/**
 * Describes the value of a template.
 */

export class TemplateStructure {
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
   * json schema to validate the data that should be parsed into the
   */
  @ApiProperty({
    description:
      'json schema to validate the data that should be parsed into the',
  })
  @IsString()
  schema!: string;

  /**
   * Information about the used compression algorithm.
   */
  @Type(() => Compression)
  compression!: Compression;
}
