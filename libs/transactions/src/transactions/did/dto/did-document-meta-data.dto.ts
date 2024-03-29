import { ApiProperty } from '@nestjs/swagger';

// TODO evalute if this should be defined here or inside the SDK. To ass the swagger open api
/**
 * Metadata of a did document.
 */
export class DidDocumentMetaData {
  /**
   * timestamp when the document was updated the last time.
   */
  @ApiProperty()
  updated?: string;
  /**
   * If set to true the document is deactivated.
   */
  @ApiProperty()
  deactivated?: boolean;
  /**
   * timestamp when the document was updated based on the requested timestamp.
   */
  @ApiProperty()
  nextUpdate?: string;
  /**
   * version id of the current update. it will be incremented with each transaction.
   */
  @ApiProperty()
  versionId!: number;
  /**
   * version number when the document was updated based on the requested timestamp.
   */
  @ApiProperty()
  nextVersionId?: number;
  /**
   * timestamp when the document was created with the first transaction.
   */
  @ApiProperty()
  created!: string;

  /**
   * timestamp when the transaction was imported
   */
  @ApiProperty()
  imported?: string;
}
