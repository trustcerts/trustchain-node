import { ApiProperty } from '@nestjs/swagger';
import { DidTransactionDto } from '@tc/did/dto/did.transaction.dto';
import { PersistedResponse } from '../../../shared/persisted-transaction';
import { Type } from 'class-transformer';

/**
 * Describes the response of a persisted did transaction.
 */
export class DidCreationResponse extends PersistedResponse {
  /**
   * transaction that got persisted.
   */
  @ApiProperty({ type: DidTransactionDto })
  @Type(() => DidTransactionDto)
  transaction!: DidTransactionDto;
}
