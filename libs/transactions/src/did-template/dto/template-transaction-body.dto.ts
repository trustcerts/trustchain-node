import { ApiProperty } from '@nestjs/swagger';
import { DidTemplateStructure } from './template-structure.dto';
import { IsIn } from 'class-validator';
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
  @Type(() => DidTemplateStructure)
  value!: DidTemplateStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    default: TransactionType.Template,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.Template])
  type!: TransactionType;
}
