import { ApiProperty } from '@nestjs/swagger';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
import { Type } from 'class-transformer';
import { VisualRepresentationTransactionDto } from '@tc/transactions/did-visual-representation/dto/visual-representation.transaction.dto';

/**
 * Response of a visualrepresentation creation request.
 */
export class VisualRepresentationResponse extends PersistedResponse {
  /**
   * Transaction that was persisted.
   */
  @ApiProperty({
    description: 'transaction that was persisted.',
    type: VisualRepresentationTransactionDto,
  })
  @Type(() => VisualRepresentationTransactionDto)
  transaction!: VisualRepresentationTransactionDto;
}
