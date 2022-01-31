import { ApiProperty } from '@nestjs/swagger';
import { IsHash, IsIn } from 'class-validator';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Describes the values of a hash transaction.
 */

export class TransactionHashValue {
  /**
   * hashBlock of the hash
   */
  @ApiProperty({
    description: 'hashBlock of the hash',
    example: '9991d650bd700b85f15ec25e0d0275cfa988a4401378b9e3b95c8fe8d1a5b61e',
  })
  @IsHash(WalletClientService.defaultHashAlgorithm)
  hash!: string;

  /**
   * Used hash algorithm so the Client can ask a node about the different used algorithms.
   */
  @ApiProperty({
    description: `Used algorithm for the hash.`,
    example: 'sha256',
  })
  @IsIn([WalletClientService.defaultHashAlgorithm])
  algorithm!: string;
}
