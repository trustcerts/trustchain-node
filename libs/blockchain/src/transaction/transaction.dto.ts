import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { PersistedBlock } from '@tc/blockchain/block/persisted-block.interface';
import { SignatureInfo } from './signature-info';
import { TransactionBody } from './transaction-body';
import { TransactionMetadata } from './transaction-metadata';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Basic Datatransferobject for transactions.
 */
export class TransactionDto {
  /**
   * Sets version and passed values.
   * @param value
   */
  constructor(type: TransactionType, value: any) {
    this.version = 1;
    this.body = {
      type,
      version: 1,
      date: new Date().toISOString(),
      value,
    };
  }

  /**
   * Version number of the base transaction.
   */
  @ApiProperty({
    description: 'Version number of the base transaction.',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  version!: number;

  /**
   * Appended meta data
   */
  @Type(() => TransactionMetadata)
  metadata!: TransactionMetadata;

  /**
   * Body of a transaction.
   */
  @Type(() => TransactionBody)
  body!: TransactionBody;

  /**
   * signatures of the value.
   */
  // @ApiProperty({ description: 'signature of the values' })
  @Type(() => SignatureInfo)
  signature!: SignatureInfo;

  /**
   * Information about the persisted block.
   */
  @ApiHideProperty()
  block?: PersistedBlock;
}
