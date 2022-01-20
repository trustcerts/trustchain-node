import { ApiProperty } from '@nestjs/swagger';
import { DidStructure } from './did-structure';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { TransactionBody } from '@tc/blockchain/transaction/transaction-body';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Body of a did transaction.
 */

export class DidTransactionBody extends TransactionBody {
  /**
   * Elements of the did document.
   */
  @Type(() => DidStructure)
  value!: DidStructure;

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
