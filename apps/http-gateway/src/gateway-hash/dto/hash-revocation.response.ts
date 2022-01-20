import { ApiProperty } from '@nestjs/swagger';
import { HashRevocationTransactionDto } from '@tc/hash/dto/hash-revocation.transaction.dto';
import { PersistedResponse } from '@shared/http/dto/persisted-response';

/**
 * Response of a hash revoke request.
 */

export class HashRevocationResponse extends PersistedResponse {
  /**
   * Transaction that was persisted.
   */
  @ApiProperty({
    description: 'transaction that was persisted.',
    type: HashRevocationTransactionDto,
  })
  transaction!: HashRevocationTransactionDto;
}
