import { DidTransactionDto } from '@shared/did/dto/did.transaction.dto';
import { SchemaTransactionBody } from './schema-transaction-body.dto';

/**
 * Class to handle schemas
 */
export class SchemaTransactionDto extends DidTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: SchemaTransactionBody;
}
