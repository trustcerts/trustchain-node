import { ApiProperty } from '@nestjs/swagger';
import { DidPublicKey, DidService } from '../dto/did.transaction.dto';
import { IDidIdDocument } from '@trustcerts/core';
import { RoleManageAddEnum } from '@tc/did/constants';

/**
 * Did document based on the transactions.
 */

export class DidIdDocument implements IDidIdDocument {
  /**
   * schemas that define the document.
   */
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

  /**
   * array of keys that belong to the did document.
   */
  @ApiProperty({
    description: 'array of keys that belong to the did document.',
    type: [DidPublicKey],
  })
  verificationMethod!: DidPublicKey[];

  /**
   * keys that are used for authentication.
   */
  @ApiProperty({ description: 'keys that are used for authentication.' })
  authentication!: string[];

  /**
   * keys that are used for assertion.
   */
  @ApiProperty({ description: 'keys that are used for assertion.' })
  assertionMethod!: string[]; /**
     
    /**
     * keys that are used for modification.
     */

  /**
     
    /**
     * keys that are used for modification.
     */ @ApiProperty({ description: 'keys that are used for modification.' })
  modification!: string[];

  /**
   * services that are connected with this did.
   */
  @ApiProperty({
    description: 'services that are connected with this did.',
    type: [DidService],
  })
  service!: DidService[];

  /**
   * Roles that belong to this did.
   */
  @ApiProperty({
    description: 'role of the did',
    enum: RoleManageAddEnum,
    isArray: true,
  })
  role!: RoleManageAddEnum[];
}
