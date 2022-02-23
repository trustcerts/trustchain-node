import { Block } from '@tc/blockchain/block/block.interface';
import { Injectable } from '@nestjs/common';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { getHash } from '@trustcerts/core';

/**
 * Contains the function to interact with the blockchain.
 */
@Injectable()
export class HashService {
  /**
   * Latest version number to use for block generation
   */
  public blockVersion = 1;

  /**
   * Replacement string for the very first block in the blockchain.
   */
  public readonly GENESIS_PREVIOUS_HASH: string = 'Genesis';

  /**
   * Hash given block depending on the block's version. Hash everything but the body that includes the transactions.
   * @param {Block} block
   * @return {string}
   */
  hashBlock(block: Block): Promise<string> {
    delete (block as any).transactions;
    const hashString = JSON.stringify(block);
    return getHash(hashString);
  }

  /**
   * Hash given transactions.
   * @param transactions given transactions
   */
  hashTransactions(transactions: TransactionDto[]): Promise<string> {
    return getHash(JSON.stringify(transactions));
  }

  /**
   * Hashes a transaction, removes the block value if it was added before.
   * @param transaction
   */
  hashTransaction(transaction: TransactionDto): Promise<string> {
    // copy so call by reference won't remove the block.
    const copy = { ...transaction };
    delete copy.block;
    return getHash(JSON.stringify(copy));
  }
}
