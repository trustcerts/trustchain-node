import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import {
  TransactionBody,
  TransactionDto,
} from '@tc/blockchain/transaction/transaction.dto';
import { Type } from 'class-transformer';

/**
 * Values of a security transaction.
 */
export class SecurityTransactionValue {
  /**
   * Identifier of the Client
   */
  @IsString()
  identifier!: string;
}

/**
 * Body of a security transaction
 */
export class SecurityTransactionBody extends TransactionBody {
  /**
   * Elements of the security transaction.
   */
  @ApiProperty({
    description: 'elements of the security transaction.',
  })
  @ValidateNested()
  @Type(() => SecurityTransactionValue)
  value!: SecurityTransactionValue;
}

/**
 * Datatransferobject for security transactions.
 */
export class SecurityTransactionDto extends TransactionDto {
  /**
   * Body from the transaction.
   */
  body!: SecurityTransactionBody;
}
