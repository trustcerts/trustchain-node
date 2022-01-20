import { ApiProperty } from '@nestjs/swagger';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
import { TemplateTransactionDto } from '@tc/template/dto/template.transaction.dto';
import { Type } from 'class-transformer';

/**
 * Response of a template creation request.
 */
export class TemplateCreationResponse extends PersistedResponse {
  /**
   * Transaction that was persisted.
   */
  @ApiProperty({
    description: 'transaction that was persisted.',
    type: TemplateTransactionDto,
  })
  @Type(() => TemplateTransactionDto)
  transaction!: TemplateTransactionDto;
}
