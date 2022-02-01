import { ApiProperty } from '@nestjs/swagger';
import { PersistedResponse } from '@shared/http/dto/persisted-response';
import { SchemaTransactionDto } from '@tc/schema/dto/schema.transaction.dto';
import { Type } from 'class-transformer';

/**
 * Response of a schema creation request.
 */
export class SchemaCreationResponse extends PersistedResponse {
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
