import { ApiProperty } from '@nestjs/swagger';
import { DidTransactionDto } from '@tc/transactions/transactions/did/dto/did.transaction.dto';
import { Type } from 'class-transformer';
import { VisualRepresentationTransactionBody } from './visual-representation-transaction-body.dto';

/**
 * Class to handle visualrepresentations
 */
export class VisualRepresentationTransactionDto extends DidTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @ApiProperty({
    type: VisualRepresentationTransactionBody,
  })
  @Type(() => VisualRepresentationTransactionBody)
  body!: VisualRepresentationTransactionBody;
}
