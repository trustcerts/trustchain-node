import { ApiProperty } from '@nestjs/swagger';
import { HashTransactionDto } from '@tc/hash/dto/hash-transaction.dto';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
import { Type } from 'class-transformer';

/**
 * Response of a hash creation request.
 */
export class HashResponse extends PersistedResponse {
  /**
   * Transaction that was persisted.
   */
  @ApiProperty({
    description: 'transaction that was persisted.',
    type: HashTransactionDto,
  })
  @Type(() => HashTransactionDto)
  transaction!: HashTransactionDto;
}
