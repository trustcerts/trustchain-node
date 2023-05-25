import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '../schemas/did.schema';
import { DidDocumentMetaData } from './did-document-meta-data.dto';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';

/**
 * Response of a parsed did document.
 */
export abstract class DocResponse {
  /**
   * parsed did document
   */
  @ApiProperty({
    description: 'parsed did document',
    type: DidDocument,
  })
  abstract document: DidDocument;

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
