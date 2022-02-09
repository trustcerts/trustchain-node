import { ApiProperty } from '@nestjs/swagger';
import { Compression } from './compression.dto';
import { DidDocument } from '@shared/did/did-document';
import { Type } from 'class-transformer';

/**
 * Did document based on the transactions.
 */

export class DidTemplateDocument extends DidDocument {
  /**
   * template that should be used. Will be stored in the file system so the size only matters when sending the template
   */
  @ApiProperty({
    description: 'template that should be used.',
  })
  template!: string;

  /**
   * did of the schema the template is based on
   */
  @ApiProperty({
    description: 'did of the schema the template is based on',
  })
  schemaId!: string;

  /**
   * Information about the used compression algorithm.
   */
  @Type(() => Compression)
  compression!: Compression;
}
