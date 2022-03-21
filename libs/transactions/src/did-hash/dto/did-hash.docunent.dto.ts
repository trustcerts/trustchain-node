import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/dto/did-document.dto';

/**
 * Did document based on the transactions.
 */
// TODO define implements IDidSchemaDocument
export class DidHashDocument extends DidDocument {
  /**
   * used algorithm
   */
  @ApiProperty({ description: 'used algorithm' })
  algorithm!: string;

  /**
   * revoked status
   */
  @ApiProperty({ description: 'date when the credential got revoked' })
  revoked?: string;
}
