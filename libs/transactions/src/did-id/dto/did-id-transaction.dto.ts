import { ApiProperty } from '@nestjs/swagger';
import { DidIdStructure } from './did-id-structure.dto';
import { DidIdTransactionBody } from './did-id-transaction-body.dto';
import { DidTransactionDto } from '@tc/transactions/transactions/did/dto/did.transaction.dto';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Datatransferobject for did transactions.
 */
export class DidIdTransactionDto extends DidTransactionDto {
  /**
   * Inits the type and the signature values.
   * @param value
   * @param didDocSignature
   */
  constructor(value: DidIdStructure, didDocSignature: SignatureInfo) {
    super(TransactionType.Did, value);
    //TODO check if this is correct
    if (!this.metadata) {
      this.metadata = {
        version: 1,
      };
    }
    this.metadata.didDocSignature = didDocSignature;
  }

  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @ApiProperty({
    type: DidIdTransactionBody,
  })
  @Type(() => DidIdTransactionBody)
  body!: DidIdTransactionBody;
}
