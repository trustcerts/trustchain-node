import { TemplateTransactionBody } from './template-transactionbody.dto';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Class to handle templates
 */
export class TemplateTransactionDto extends TransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: TemplateTransactionBody;
}
