import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsRFC3339,
  ValidateNested,
} from 'class-validator';
import { PersistedBlock } from '@tc/blockchain/block/persisted-block.interface';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Types of the signature combinations of a transaction.
 */
export enum SignatureType {
  /**
   * Single signature.
   */
  single = 'single',
  // TODO define how many signatures are required for a valid multi signature.
  /**
   * Multi signature
   */
  multi = 'multi',
}

/**
 * Signature information that signed the transaction.
 */
export class SignatureInfo {
  /**
   * Type of the signature procedure.
   */
  @ApiProperty({
    description: 'Type of the signature procedure.',
    enum: SignatureType,
  })
  type!: SignatureType;

  /**
   * Signature of the value and the date.
   */
  @ApiProperty({ description: 'signature of the document values.' })
  @ValidateNested({ each: true })
  @Type(() => SignatureDto)
  values!: SignatureDto[];
}

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
}

/**
 * Values of a transaction.
 */
export class TransactionBody {
  /**
   * Version number of the transaction type.
   */
  @ApiProperty({
    description: 'Version number of the transaction.',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  version!: number;

  /**
   * type of the transaction
   */
  @ApiHideProperty()
  type!: TransactionType;

  /**
   * timestamp when transaction was created.
   */
  @ApiProperty({
    description: 'timestamp when transaction was created.',
    example: new Date().toISOString(),
  })
  @IsRFC3339()
  date!: string;

  /**
   * Body of a transaction.
   */
  value: any;
}

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
