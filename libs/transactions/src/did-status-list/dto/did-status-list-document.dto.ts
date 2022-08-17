import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/dto/did-document.dto';
import { StatusPurpose } from './status-purpose.dto';

/**
 * Did document based on the transactions.
 */

export class DidStatusListDocument extends DidDocument {
  /**
   * Encoded bitstring
   */
  @ApiProperty({ description: 'enocded bitstring' })
  encodedList!: string;

  /**
   * purpose of the list
   */
  @ApiProperty({
    description: 'purpose of the list',
    enum: StatusPurpose,
    enumName: 'StatusPurpose',
  })
  statusPurpose!: StatusPurpose;
}
