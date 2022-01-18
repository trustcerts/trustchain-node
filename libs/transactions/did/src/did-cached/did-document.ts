import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@shared/did/did-document';
import { DidPublicKey, DidService } from '../dto/did.transaction.dto';
import { IDidIdDocument } from '@trustcerts/core';
import { RoleManageAddEnum } from '@tc/did/constants';

/**
 * Did document based on the transactions.
 */

export class DidIdDocument extends DidDocument implements IDidIdDocument {
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
  assertionMethod!: string[];

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
