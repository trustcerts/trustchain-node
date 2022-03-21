import { ApiProperty } from '@nestjs/swagger';
import { DidHashStructure } from './hash-structure.dto';
import { DidTransactionBody } from '@tc/transactions/transactions/did/dto/did-transaction-body.dto';
import { Type } from 'class-transformer';

/**
 * Body of a hash transaction.
 */

export class HashTransactionBody extends DidTransactionBody {
  /**
   * Elements of the did document.
   */
  @ApiProperty({
    description: 'elements of the did document',
    type: DidHashStructure,
  })
  @Type(() => DidHashStructure)
  value!: DidHashStructure;
}
