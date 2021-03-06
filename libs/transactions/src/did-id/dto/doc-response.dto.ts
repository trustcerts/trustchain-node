import { ApiProperty } from '@nestjs/swagger';
import { DidIdDocument } from './did-id-document.dto';
import { DocResponse } from '@tc/transactions/transactions/did/dto/doc-response.dto';

/**
 * Response of a parsed did document.
 */

export class IdDocResponse extends DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({ description: 'parsed did document', type: DidIdDocument })
  document!: DidIdDocument;
}
