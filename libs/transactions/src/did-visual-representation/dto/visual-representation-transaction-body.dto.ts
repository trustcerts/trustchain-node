import { ApiProperty } from '@nestjs/swagger';
import { DidVisualRepresentationStructure } from './visual-representation-structure.dto';
import { IsIn } from 'class-validator';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Body of the transaction.
 */

export class VisualRepresentationTransactionBody extends TransactionBody {
  /**
   * Values of the visualrepresentation transaction.
   */
  @ApiProperty({
    description: 'unique identifier of a visualrepresentation',
    type: DidVisualRepresentationStructure,
  })
  @Type(() => DidVisualRepresentationStructure)
  value!: DidVisualRepresentationStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    example: TransactionType.VisualRepresentation,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.VisualRepresentation])
  type!: TransactionType;
}
