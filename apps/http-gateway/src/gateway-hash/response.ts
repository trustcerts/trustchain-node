import { ApiProperty } from '@nestjs/swagger';
import { HashCreationTransactionDto } from '@tc/hash/dto/hash-creation.transaction.dto';
import { HashRevocationTransactionDto } from '@tc/hash/dto/hash-revocation.transaction.dto';
import { PersistedResponse } from '../../../shared/http/persisted-transaction';
import { Type } from 'class-transformer';

/**
 * Response of a hash creation request.
 */
export class HashCreationResponse extends PersistedResponse {
  /**
   * Transaction that was persisted.
   */
  @ApiProperty({
    description: 'transaction that was persisted.',
    type: HashCreationTransactionDto,
  })
  @Type(() => HashCreationTransactionDto)
  transaction!: HashCreationTransactionDto;
}

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
