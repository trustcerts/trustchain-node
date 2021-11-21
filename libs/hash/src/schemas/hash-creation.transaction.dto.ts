import { ApiProperty } from '@nestjs/swagger';
import {
  HashTransactionBody,
  HashTransactionDto,
} from './hash.transaction.dto';
import { IsIn } from 'class-validator';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Body of a hash creation transaction.
 */
export class HashCreationTransactionBody extends HashTransactionBody {
  /**
   * type of the transaction.
   */
  @ApiProperty({
    default: TransactionType.HashCreation,
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  @IsIn([TransactionType.HashCreation])
  type!: TransactionType;
}

/**
 * Datatransferobject for hash transactions.
 */
export class HashCreationTransactionDto extends HashTransactionDto {
  /**
   * Body of the transaction. Defined by each transaction type.
   */
  body!: HashCreationTransactionBody;
}
