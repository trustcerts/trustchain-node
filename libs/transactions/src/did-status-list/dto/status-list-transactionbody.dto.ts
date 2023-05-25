import { ApiProperty } from '@nestjs/swagger';
import { DidStatusListStructure } from './status-list-structure.dto';
import { IsIn } from 'class-validator';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Body of the transaction.
 */

export class StatusListTransactionBody extends TransactionBody {
  /**
   * Values of the statuslist transaction.
   */
  @Type(() => DidStatusListStructure)
  value!: DidStatusListStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    default: TransactionType.StatusList,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.StatusList])
  type!: TransactionType;
}
