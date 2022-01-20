import { ApiProperty } from '@nestjs/swagger';
import { Block } from '@tc/blockchain/block/block.interface';
import { DidIdTransactionDto } from '../../../transactions/did-id/src/dto/did-id.transaction.dto';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';

/**
 * Describes the first elements of the chain.
 */
export class GenesisBlock implements Block {
  /**
   * Indey of the block.
   */
  @ApiProperty({
    description: 'index of the block',
  })
  index!: number;

  /**
   * Hash of the previous block. In case of the genesis block this is a static value.
   */
  @ApiProperty({
    description: 'hash of the previous block',
  })
  previousHash!: string;

  /**
   * merkle root hash.
   */
  @ApiProperty({
    description: 'merkle root hash',
  })
  hash!: string;

  /**
   * timestamp of the block.
   */
  @ApiProperty({
    description: 'timestamp of the block',
  })
  timestamp!: string;

  /**
   * transactions that are included in this block.
   */
  @ApiProperty({
    description: 'transactions that are included in this block',
  })
  transactions!: DidIdTransactionDto[];

  /**
   * version of this block.
   */
  @ApiProperty({
    description: 'version of this block',
  })
  version!: number;

  /**
   * signatures of the validators that accepted the block.
   */
  @ApiProperty({
    description: 'signatures of the validators that accepted the block',
  })
  signatures!: SignatureDto[];

  /**
   * validator that proposed the block.
   */
  @ApiProperty({
    description: 'validator that proposed the block',
  })
  proposer!: SignatureDto;
}
