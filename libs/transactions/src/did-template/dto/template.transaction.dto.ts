import { DidTransactionDto } from '@tc/transactions/transactions/did/dto/did.transaction.dto';
import { TemplateTransactionBody } from './template-transactionbody.dto';

/**
 * Class to handle templates
 */
export class TemplateTransactionDto extends DidTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: TemplateTransactionBody;
}
