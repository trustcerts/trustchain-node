import { ApiProperty } from '@nestjs/swagger';
import { DidDocumentMetaData } from './DidDocumentMetaData';
import { DidIdDocument } from './DidDocument';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';

/**
 * Response of a parsed did document.
 */

export class DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({ description: 'parsed did document', type: DidIdDocument })
  document!: DidIdDocument;

  /**
   * signatures of te parsed did document.
   */
  @ApiProperty({
    description: 'signatures of the parsed document',
    type: [SignatureDto],
  })
  signatures!: SignatureDto[];

  /**
   * metadata of the document.
   */
  @ApiProperty({
    description: 'Metadata of the document',
    type: DidDocumentMetaData,
  })
  metaData!: DidDocumentMetaData;
}
