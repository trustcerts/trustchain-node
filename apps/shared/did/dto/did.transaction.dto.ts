import { DidStructure } from './did-structure';
import { DidTransactionBody } from './did-id-transaction-body';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Datatransferobject for did transactions.
 */
export class DidTransactionDto extends TransactionDto {
  /**
   * Inits the type and the signature values.
   * @param value
   */
  constructor(value: DidStructure, didDocSignature: SignatureInfo) {
    super(TransactionType.Did, value);
    this.body.didDocSignature = didDocSignature;
    this.signature = {
      type: SignatureType.single,
      values: [],
    };
  }

  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @Type(() => DidTransactionBody)
  body!: DidTransactionBody;
}
