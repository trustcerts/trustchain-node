import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsPositive,
  IsRFC3339,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { Type } from 'class-transformer';

/**
 * Interface that describes the block including the transaction to be persisted.
 */
export class ProposedBlock {
  /**
   * number of the block.
   */
  @IsNumber()
  @IsPositive()
  index!: number;

  /**
   * hashBlock of the previous block
   */
  @IsString()
  previousHash!: string;

  /**
   *  hashBlock of the transactions.
   */
  @IsString()
  hash!: string;

  /**
   * Hash of the state root.
   */
  @IsString()
  stateRootHash!: string;

  /**
   * timestamp when the block was proposed
   */
  @IsRFC3339()
  timestamp!: string;

  /**
   * transactions that are included in this block
   */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions!: TransactionDto[];

  /**
   * Version of block interpretation
   */
  @IsNumber()
  version!: number;
}
