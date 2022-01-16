import { ApiProperty } from '@nestjs/swagger';
import {
  IDENTIFIER_LENGTH_MAX,
  IDENTIFIER_LENGTH_MIN,
} from '@tc/p2-p/connect.const';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Interface to to filter hashes.
 */
export class HashFilterDto {
  /**
   * Identifier of the Client that signed a hash.
   */
  @ApiProperty({ description: 'Identifier of the Client that signed a hash.' })
  @IsOptional()
  @IsString()
  @MinLength(IDENTIFIER_LENGTH_MIN)
  @MaxLength(IDENTIFIER_LENGTH_MAX)
  client?: string;

  /**
   * Minimum time. Value is compared with the creation date.
   */
  @ApiProperty({ description: 'Minimum time' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  from?: string;

  /**
   * Maximum time. Value is compared with creation date, not the revocation one.
   */
  @ApiProperty({ description: 'Maximum time.' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  to?: string;

  /**
   * Amount of elements that should be skipped to realise pagination.
   */
  @ApiProperty({
    description:
      'Amount of elements that should be skipped to realise pagination.',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  skip?: number;

  /**
   * Amount of elements that should be displayed.
   */
  @ApiProperty({ description: 'Amount of elements that should be displayed.' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  take?: number;
}
