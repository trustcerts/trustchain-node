import { ApiProperty } from '@nestjs/swagger';
import { DID_ID_NAME } from '@tc/did-id/constants';
import { DidStructure } from '@shared/did/dto/did-structure.dto';
import { IsIn, IsString, Matches } from 'class-validator';
import { WalletClientService } from '@tc/wallet-client';
import { getDid } from '@shared/helpers';

/**
 * Describes the value of a schema.
 */

export class DidHashStructure extends DidStructure {
  /**
   * Unique identifier.
   */
  @ApiProperty({
    // TODO set correct example
    example: '123456789ABCDEFGHJKLMN',
    description: 'unique identifier of a did',
  })
  @Matches(getDid(DID_ID_NAME, 64))
  @IsString()
  id!: string;

  /**
   * Used hash algorithm so the Client can ask a node about the different used algorithms.
   */
  @ApiProperty({
    description: `Used algorithm for the hash.`,
    example: 'sha256',
  })
  @IsIn([WalletClientService.defaultHashAlgorithm])
  algorithm?: string;

  /**
   * If set to true the hash is revoked.
   */
  @ApiProperty({
    description: 'if set to a date it will revoke the hash',
    example: true,
  })
  @IsString()
  revoked?: string;
}
