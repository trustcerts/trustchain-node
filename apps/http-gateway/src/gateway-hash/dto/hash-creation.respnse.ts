import { ApiProperty } from '@nestjs/swagger';
import { HashCreationTransactionDto } from '@tc/hash/dto/hash-creation.transaction.dto';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
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
