import { ApiProperty } from '@nestjs/swagger';
import { DidStructure } from '@shared/did/dto/did-structure.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * Describes the value of a schema.
 */

export class DidSchemaStructure extends DidStructure {
  /**
   * json schema to validate the data that should be parsed into the
   */
  @ApiProperty({
    description:
      'json schema to validate the data that should be parsed into the',
    required: false,
  })
  @IsOptional()
  @IsString()
  schema?: string;
}
