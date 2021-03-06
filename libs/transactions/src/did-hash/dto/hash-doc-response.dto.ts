import { ApiProperty } from '@nestjs/swagger';
import { DidHashDocument } from './did-hash.docunent.dto';
import { DocResponse } from '@tc/transactions/transactions/did/dto/doc-response.dto';

/**
 * Response of a parsed did document.
 */

export class HashDocResponse extends DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({ description: 'parsed did document', type: DidHashDocument })
  document!: DidHashDocument;
}
