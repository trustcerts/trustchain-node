import { ApiProperty } from '@nestjs/swagger';
import { ImportedMetadata } from './imported-metadata';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { SignatureInfo } from './signature-info';
import { Type } from 'class-transformer';

/**
 * Metadata that include more information that where added later.
 */

export class TransactionMetadata {
  /**
   * Version number of the base transaction.
   */
  @ApiProperty({
    description: 'Version number of the metadata.',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  version!: number;

  /**
   * If set the timestamp of the metadata is set as the created at timestamp. Required when data should be imported from another blockchain.
   */
  @IsOptional()
  @Type(() => ImportedMetadata)
  imported?: ImportedMetadata;

  /**
   * Signature of the did document after applying the changes.
   */
  @IsOptional()
  @Type(() => SignatureInfo)
  didDocSignature?: SignatureInfo;
}
