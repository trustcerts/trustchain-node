import { ApiProperty } from '@nestjs/swagger';
import { Block } from '@tc/blockchain/block/block.interface';
import { DidTransactionDto } from '../../../did/src/dto/did.transaction.dto';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';

export class GenesisBlock implements Block {
  @ApiProperty({
    description: 'index of the block',
  })
  index!: number;
  @ApiProperty({
    description: 'hash of the previous block',
  })
  previousHash!: string;
  @ApiProperty({
    description: 'merkle root hash',
  })
  hash!: string;
  @ApiProperty({
    description: 'timestamp of the block',
  })
  timestamp!: string;
  @ApiProperty({
    description: 'transactions that are included in this block',
  })
  transactions!: DidTransactionDto[];
  @ApiProperty({
    description: 'version of this block',
  })
  version!: number;
  @ApiProperty({
    description: 'signatures of the validators that accepted the block',
  })
  signatures!: SignatureDto[];
  @ApiProperty({
    description: 'validator that proposed the block',
  })
  proposer!: SignatureDto;
}
