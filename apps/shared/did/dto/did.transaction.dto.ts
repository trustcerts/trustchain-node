import { DidStructure } from './did-structure.dto';
import { DidTransactionBody } from './did-transaction-body.dto';
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
  constructor(transactionType: TransactionType, value: DidStructure) {
    super(transactionType, value);
    this.signature = {
      type: SignatureType.Single,
      values: [],
    };
  }

  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @Type(() => DidTransactionBody)
  body!: DidTransactionBody;
}
