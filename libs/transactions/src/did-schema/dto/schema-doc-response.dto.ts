import { ApiProperty } from '@nestjs/swagger';
import { DidSchemaDocument } from './did-schema-document.dto';
import { DocResponse } from '@tc/transactions/transactions/did/dto/doc-response.dto';

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
