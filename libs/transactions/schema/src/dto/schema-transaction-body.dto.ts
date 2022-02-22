import { ApiProperty } from '@nestjs/swagger';
import { DidSchemaStructure } from './did-schema-structure.dto';
import { IsIn } from 'class-validator';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Body of the transaction.
 */
export class SchemaTransactionBody extends TransactionBody {
  /**
   * Values of the schema transaction.
   */
  @Type(() => DidSchemaStructure)
  value!: DidSchemaStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    example: TransactionType.Schema,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.Schema])
  type!: TransactionType;
}
