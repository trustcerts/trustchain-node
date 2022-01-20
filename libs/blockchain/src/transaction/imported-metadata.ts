import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsRFC3339 } from 'class-validator';
import { SignatureInfo } from './signature-info';
import { Type } from 'class-transformer';

/**
 * Information about an imported transaction from another blockchain.
 */

export class ImportedMetadata {
  /**
   * timestamp when transaction was persisted in the old blockchain.
   */
  @ApiProperty({
    description:
      'timestamp when transaction was persisted in the old blockchain.',
    example: new Date().toISOString(),
  })
  @IsRFC3339()
  date!: string;

  /**
   * If set the timestamp of the metadata is set as the created at timestamp. Required when data should be imported from another blockchain.
   */
  @IsObject()
  @Type(() => SignatureInfo)
  imported!: SignatureInfo;
}
