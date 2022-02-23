import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsString, Matches } from 'class-validator';
import { Prop } from '@nestjs/mongoose';
import { TEMPLATE_NAME } from '../constants';
import {
  TransactionBody,
  TransactionDto,
} from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';
import { getDid } from '@shared/helpers';

/**
 * Types of compression that are supported.
 */
export enum CompressionType {
  JSON = 'JSON',
  PROTO = 'PROTO',
}
/**
 * Information about  the used compression for the values
 */
export class Compression {
  /**
   * Name of the compression
   */
  @ApiProperty({
    description: 'type of the compression',
    enum: CompressionType,
    example: CompressionType.JSON,
  })
  @IsEnum(CompressionType)
  @Prop()
  type!: CompressionType;

  /**
   * Json encoded information that are required for this kind of compression.
   */
  @ApiProperty({
    description:
      'Json encoded information that are required for this kind of compression.',
  })
  @Prop()
  value?: string;
}

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

/**
 * Body of the transaction.
 */
export class TemplateTransactionBody extends TransactionBody {
  /**
   * Values of the template transaction.
   */
  @Type(() => TemplateStructure)
  value!: TemplateStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    default: TransactionType.HashCreation,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.HashCreation])
  type!: TransactionType;
}

/**
 * Class to handle templates
 */
export class TemplateTransactionDto extends TransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: TemplateTransactionBody;
}
