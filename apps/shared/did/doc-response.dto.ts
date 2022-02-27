import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from './did-document.dto';
import { DidDocumentMetaData } from './did-document-meta-data';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';

/**
 * Response of a parsed did document.
 */

export class DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({ description: 'parsed did document', type: DidDocument })
  document!: DidDocument;

  /**
   * signatures of te parsed did document.
   */
  @ApiProperty({
    description: 'signatures of the parsed document',
    type: SignatureInfo,
  })
  signatures!: SignatureInfo;

  /**
   * metadata of the document.
   */
  @ApiProperty({
    description: 'Metadata of the document',
    type: DidDocumentMetaData,
  })
  metaData!: DidDocumentMetaData;
}
