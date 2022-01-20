import { ApiProperty } from '@nestjs/swagger';
import { DidIdStructure } from './did-id-structure';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Body of a did transaction.
 */

export class DidIdTransactionBody extends TransactionBody {
  /**
   * Elements of the did document.
   */
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

  /**
   * Signature of the did document after applying the changes.
   */
  @ApiProperty({
    description: 'signature of the did document after applying the changes',
  })
  @Type(() => SignatureInfo)
  didDocSignature!: SignatureInfo;
}
