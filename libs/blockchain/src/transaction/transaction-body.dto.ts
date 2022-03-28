import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsRFC3339 } from 'class-validator';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Values of a transaction.
 */

export class TransactionBody {
  /**
   * Version number of the transaction type.
   */
  @ApiProperty({
    description: 'Version number of the transaction.',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  version!: number;

  /**
   * type of the transaction
   */
  @ApiHideProperty()
  type!: TransactionType;

  /**
   * timestamp when transaction was created.
   */
  @ApiProperty({
    description: 'timestamp when transaction was created.',
    example: new Date().toISOString(),
  })
  @IsRFC3339()
  date!: string;

  /**
   * Body of a transaction.
   */
  value: any;
}
