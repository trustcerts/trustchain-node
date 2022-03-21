import { ApiProperty } from '@nestjs/swagger';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
import { SchemaTransactionDto } from '@tc/transactions/did-schema/dto/schema.transaction.dto';
import { Type } from 'class-transformer';

/**
 * Response of a schema creation request.
 */
export class SchemaResponse extends PersistedResponse {
  /**
   * Transaction that was persisted.
   */
  @ApiProperty({
    description: 'transaction that was persisted.',
    type: SchemaTransactionDto,
  })
  @Type(() => SchemaTransactionDto)
  transaction!: SchemaTransactionDto;
}
