import { ApiProperty } from '@nestjs/swagger';
import { DidSchemaDocument } from './did-schema-document';
import { DocResponse } from '@apps/shared/did/doc-response';

/**
 * Response of a parsed did document.
 */

export class SchemaDocResponse extends DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({ description: 'parsed did document', type: DidSchemaDocument })
  document!: DidSchemaDocument;
}
