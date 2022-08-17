import { ApiProperty } from '@nestjs/swagger';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
import { StatusListTransactionDto } from '@tc/transactions/did-status-list/dto/status-list.transaction.dto';
import { Type } from 'class-transformer';

/**
 * Response of a statuslist creation request.
 */
export class StatusListResponse extends PersistedResponse {
  /**
   * Transaction that was persisted.
   */
  @ApiProperty({
    description: 'transaction that was persisted.',
    type: StatusListTransactionDto,
  })
  @Type(() => StatusListTransactionDto)
  transaction!: StatusListTransactionDto;
}
