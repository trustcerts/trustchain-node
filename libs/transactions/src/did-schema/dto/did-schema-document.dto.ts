import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/did-document.dto';

/**
 * Did document based on the transactions.
 */
export class DidSchemaDocument extends DidDocument {
  /**
   * jsonld schema thsat defines a data structure
   */
  @ApiProperty({
    description: 'jsonld schema thsat defines a data structure',
  })
  value!: string;
}
