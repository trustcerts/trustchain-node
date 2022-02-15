import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@apps/shared/did/did-document.dto';
import { DidPublicKey } from './did-public-key.dto';
import { DidService } from './did-service.dto';
import { RoleManageType } from '@tc/did-id/constants';

/**
 * Did document based on the transactions.
 */

export class DidIdDocument extends DidDocument {
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
   */
  @ApiProperty({ description: 'keys that are used for modification.' })
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
    enum: RoleManageType,
    enumName: 'RoleManageType',
    isArray: true,
  })
  role!: RoleManageType[];
}
