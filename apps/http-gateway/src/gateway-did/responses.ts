import { ApiProperty } from '@nestjs/swagger';
import { DidIdTransactionDto } from '@tc/did/dto/did.transaction.dto';
import { PersistedResponse } from '@shared/http/persisted-transaction';
import { Type } from 'class-transformer';

/**
 * Describes the response of a persisted did transaction.
 */
export class DidCreationResponse extends PersistedResponse {
  /**
   * transaction that got persisted.
   */
  @ApiProperty({ type: DidIdTransactionDto })
  @Type(() => DidIdTransactionDto)
  transaction!: DidIdTransactionDto;
}
