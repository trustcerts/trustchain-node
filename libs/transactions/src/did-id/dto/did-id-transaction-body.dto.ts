import { ApiProperty } from '@nestjs/swagger';
import { DidIdStructure } from './did-id-structure.dto';
import { DidTransactionBody } from '@tc/transactions/transactions/did/dto/did-transaction-body.dto';
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
}
