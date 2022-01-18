import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@shared/did/did-document';

/**
 * Did document based on the transactions.
 */
// TODO define implements IDidSchemaDocument
export class DidSchemaDocument extends DidDocument {
  /**
   * array of keys that belong to the did document.
   */
  @ApiProperty({
    description: 'array of keys that belong to the did document.',
  })
  value: any;
}
