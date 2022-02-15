import { ApiProperty } from '@nestjs/swagger';

/**
 * Did document based on the transactions.
 */

export class DidDocument {
  /**
   * schemas that define the document.
   */
  @ApiProperty({
    description: 'schemas that define the document.',
  })
  '@context'!: string[];

  /**
   * unique identifier of a did.
   */
  @ApiProperty({ description: 'unique identifier of a did.' })
  id!: string;

  /**
   * unique identifier of the did's controllers.
   */
  @ApiProperty({ description: 'unique identifiers of the controller.' })
  controller!: string[];
}
