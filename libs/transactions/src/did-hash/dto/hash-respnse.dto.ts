import { ApiProperty } from '@nestjs/swagger';
import { HashDidTransactionDto } from '@tc/transactions/did-hash/dto/hash-transaction.dto';
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
    type: HashDidTransactionDto,
  })
  @Type(() => HashDidTransactionDto)
  transaction!: HashDidTransactionDto;
}
