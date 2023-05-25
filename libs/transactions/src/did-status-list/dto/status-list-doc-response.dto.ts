import { ApiProperty } from '@nestjs/swagger';
import { DidStatusListDocument } from '../schemas/did-status-list.schema';
import { DocResponse } from '@tc/transactions/transactions/did/dto/doc-response.dto';

/**
 * Response of a parsed did document.
 */

export class StatusListDocResponse extends DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({
    description: 'parsed did document',
    type: DidStatusListDocument,
  })
  document!: DidStatusListDocument;
}
