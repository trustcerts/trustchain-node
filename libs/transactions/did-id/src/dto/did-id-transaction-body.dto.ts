import { ApiProperty } from '@nestjs/swagger';
import { DidIdStructure } from './did-id-structure.dto';
import { DidTransactionBody } from '@shared/did/dto/did-transaction-body.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Body of a did transaction.
 */

export class DidIdTransactionBody extends DidTransactionBody {
  /**
   * Elements of the did document.
   */
  @ApiProperty({
    description: 'elements of the did document',
    type: DidIdStructure,
  })
  @Type(() => DidIdStructure)
  value!: DidIdStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  type!: TransactionType;
}
