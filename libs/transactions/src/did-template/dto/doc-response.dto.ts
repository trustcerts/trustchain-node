import { ApiProperty } from '@nestjs/swagger';
import { DidTemplateDocument } from '../schemas/did-template.schema';
import { DocResponse } from '@tc/transactions/transactions/did/dto/doc-response.dto';

/**
 * Response of a parsed did document.
 */

export class TemplateDocResponse extends DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({
    description: 'parsed did document',
    type: DidTemplateDocument,
  })
  document!: DidTemplateDocument;
}
