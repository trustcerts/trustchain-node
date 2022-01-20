import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches } from 'class-validator';
import { SCHEMA_NAME } from '../constants';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';
import { getDid } from '@shared/helpers';

/**
 * Describes the value of a schema.
 */
export class SchemaStructure {
  /**
   * Unique identifier.
   */
  @ApiProperty({
    // TODO set correct example
    example: '123456789ABCDEFGHJKLMN',
    description: 'unique identifier of a schema',
  })
  @Matches(getDid(SCHEMA_NAME))
  @IsString()
  id!: string;

  /**
   * json schema to validate the data that should be parsed into the
   */
  @ApiProperty({
    description:
      'json schema to validate the data that should be parsed into the',
  })
  @IsString()
  schema!: string;

  @ApiProperty({
    description: 'ids of the entities that are allowed to update the schema',
  })
  @IsString()
  controllers!: string[];
}

/**
 * Body of the transaction.
 */
export class SchemaTransactionBody extends TransactionBody {
  /**
   * Values of the schema transaction.
   */
  @Type(() => SchemaStructure)
  value!: SchemaStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    default: TransactionType.Schema,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.Schema])
  type!: TransactionType;
}

/**
 * Class to handle schemas
 */
export class SchemaTransaction extends TransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: SchemaTransactionBody;
}
