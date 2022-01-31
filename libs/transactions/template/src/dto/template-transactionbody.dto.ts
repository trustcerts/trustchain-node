import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TemplateStructure } from './templatestructure.dto';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

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
