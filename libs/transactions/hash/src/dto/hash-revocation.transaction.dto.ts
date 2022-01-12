import { ApiProperty } from '@nestjs/swagger';
import {
  HashTransactionBody,
  HashTransactionDto,
} from './hash.transaction.dto';
import { IsIn } from 'class-validator';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';

/**
 * Body of a hash creation transaction.
 */
export class HashRevocationTransactionBody extends HashTransactionBody {
  /**
   * type of the transaction.
   */
  @ApiProperty({
    default: TransactionType.HashRevocation,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.HashRevocation])
  type!: TransactionType;
}

/**
 * Datatransferobject for hash transactions.
 */
export class HashRevocationTransactionDto extends HashTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @Type(() => HashRevocationTransactionBody)
  body!: HashRevocationTransactionBody;
}
