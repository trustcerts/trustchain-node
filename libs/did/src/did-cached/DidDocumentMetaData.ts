import { ApiProperty } from '@nestjs/swagger';
import { DidDocumentMetaData as IDidDocumentMetaData } from '@trustcerts/sdk';

/**
 * Metadata of a did document.
 */

export class DidDocumentMetaData implements IDidDocumentMetaData {
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
}
