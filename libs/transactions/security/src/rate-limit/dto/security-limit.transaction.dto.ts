import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, ValidateNested } from 'class-validator';
import {
  SecurityTransactionDto,
  SecurityTransactionValue,
} from '@tc/security/dto/security.transaction.dto';
import { TransactionBody } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Describes the values of the transaction.
 */
export class SecurityLimitTransactionValue extends SecurityTransactionValue {
  /**
   * Monthly limit of the user. If set to 0 there is no limit.
   */
  @IsNumber()
  @Min(0)
  amount!: number;
}

/**
 * Body of a security limit transaction.
 */
export class SecurityLimitTransactionBody extends TransactionBody {
  /**
   * Elements of the security transaction.
   */
  @ApiProperty({
    description: 'elements of the security transaction.',
  })
  @ValidateNested()
  @Type(() => SecurityLimitTransactionValue)
  value!: SecurityLimitTransactionValue;
}

/**
 * Datatransferobject for security transactions.
 */
export class SecurityLimitTransactionDto extends SecurityTransactionDto {
  /**
   * Sets the type of the transaction and passes values to the parent class.
   * @param value
   */
  constructor(value: SecurityLimitTransactionValue) {
    super(TransactionType.SecurityLimit, value);
  }

  /**
   * Body of a security limit transaction.
   */
  body!: SecurityLimitTransactionBody;
}
