import { ApiProperty } from '@nestjs/swagger';
import { PersistedResponse } from '@shared/http/persisted-transaction';
import { SchemaTransaction } from '@tc/schema/dto/schema.transaction.dto';
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
    type: SchemaTransaction,
  })
  @Type(() => SchemaTransaction)
  transaction!: SchemaTransaction;
}
