import { ApiProperty } from '@nestjs/swagger';
import { DidTemplateDocument } from './did-template-document.dto';
import { DocResponse } from '@shared/did/doc-response.dto';

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
