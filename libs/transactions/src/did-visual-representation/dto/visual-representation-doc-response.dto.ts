import { ApiProperty } from '@nestjs/swagger';
import { DidVisualRepresentationDocument } from '../schemas/did-visual-representation.schema';
import { DocResponse } from '@tc/transactions/transactions/did/dto/doc-response.dto';

/**
 * Response of a parsed did document.
 */

export class VisualRepresentationDocResponse extends DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({
    description: 'parsed did document',
    type: DidVisualRepresentationDocument,
  })
  document!: DidVisualRepresentationDocument;
}
