import { ApiProperty } from '@nestjs/swagger';
import { DidIdTransactionDto } from '@tc/did-id/dto/did-id-transaction.dto';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
import { Type } from 'class-transformer';

/**
 * Describes the response of a persisted did transaction.
 */
export class DidResponse extends PersistedResponse {
  /**
   * transaction that got persisted.
   */
  @ApiProperty({ type: DidIdTransactionDto })
  @Type(() => DidIdTransactionDto)
  transaction!: DidIdTransactionDto;
}
