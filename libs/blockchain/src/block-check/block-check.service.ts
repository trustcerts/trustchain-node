import { Block } from '@tc/blockchain/block/block.interface';
import { HashService } from '@tc/blockchain/hash.service';
import { Injectable } from '@nestjs/common';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { PersistClientService } from '@tc/persist-client';
import { TextEncoder } from 'util';
import { TransactionChecks } from '@tc/blockchain/block-check/transaction-checks.interface';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Service to check if a block is valid and can be added to the blockchain.
 */
@Injectable()
export class BlockCheckService {
  /**
   * The latest block in the current blockchain
   */
  private previousBlock?: Block;

  /**
   * Map that includes all required information to check a given transaction based on the defined type.
   */
  public types: Map<TransactionType, TransactionChecks> = new Map<
    TransactionType,
    TransactionChecks
  >();

  /**
   * Builds a BlockCheckService
   * @param hashService
   * @param persistClientService
   * @param walletClientService
   * @param didCachedService
   * @param logger
   */
  constructor(
    private readonly hashService: HashService,
    private readonly persistClientService: PersistClientService,
    private readonly walletClientService: WalletClientService,
    private readonly didCachedService: DidIdCachedService,
  ) {
    this.persistClientService
      .latestBlock()
      .then((block: Block) => {
        this.previousBlock = block;
      })
      .catch(() => {
        this.previousBlock = undefined;
      });
  }

  /**
   * Checks if a proposed block can be added to the blockchain.
   * @param block
   */
  public async checkProposedBlock(block: ProposedBlock) {
    this.previousBlock = await this.persistClientService
      .latestBlock()
      .catch(() => undefined);
    this.checkIndex(block);
    await this.checkPreviousHash(block);
    await this.checkHash(block);
    this.checkTimestamp(block);
    this.checkVersion(block);
    await this.checkProposedTransactions(block);
  }

  /**
   * Check if the index of the block is the next in the blockchain.
   * @param block
   */
  private checkIndex(block: ProposedBlock) {
    if (this.previousBlock === undefined && block.index !== 1) {
      throw new Error(
        `Index is incorrect: ${JSON.stringify({
          is: block.index,
          should: 1,
        })}`,
      );
    } else if (
      this.previousBlock !== undefined &&
      this.previousBlock.index + 1 !== block.index
    ) {
      throw new Error(
        `Index is incorrect: ${JSON.stringify({
          is: block.index,
          should: this.previousBlock.index + 1,
        })}`,
      );
    }
  }

  /**
   * Checks if the blocks previous hash matches the previous blocks hash.
   * @param block
   */
  private async checkPreviousHash(block: ProposedBlock) {
    if (!this.previousBlock) {
      if (block.previousHash !== this.hashService.GENESIS_PREVIOUS_HASH) {
        throw new Error(
          `Previous hash incorrect: ${JSON.stringify({
            is: block.previousHash,
            should: this.hashService.GENESIS_PREVIOUS_HASH,
          })}`,
        );
      }
    } else {
      const previousHash = await this.hashService.hashBlock(this.previousBlock);
      if (previousHash !== block.previousHash) {
        throw new Error(
          `Previous hash incorrect: ${JSON.stringify({
            is: previousHash,
            should: block.previousHash,
          })}`,
        );
      }
    }
  }

  /**
   * Checks if the blocks hash is correct.
   * @param block
   */
  private async checkHash(block: ProposedBlock) {
    const hash = await this.hashService.hashTransactions(block.transactions);
    if (hash !== block.hash) {
      throw new Error(
        `Hash incorrect: ${JSON.stringify({
          is: hash,
          should: block.hash,
        })}`,
      );
    }
  }

  /**
   * Checks if the blocks timestamp is correct.
   * @param block
   */
  private checkTimestamp(block: ProposedBlock) {
    // add one second delay because the clocks do not run synchrony.
    // TODO use time sync to make sure all nodes have the same synced clock.
    const date = new Date().toISOString() + 1000;
    if (this.previousBlock && block.timestamp <= this.previousBlock.timestamp) {
      throw new Error(
        `Timestamp to new: ${JSON.stringify({
          is: block.timestamp,
          should: this.previousBlock.timestamp,
        })}`,
      );
    }
    if (block.timestamp > date) {
      throw new Error(
        `Timestamp to new: ${JSON.stringify({
          is: block.timestamp,
          should: date,
        })}`,
      );
    }
  }

  /**
   * Checks if the blocks transactions are correct.
   * @param block
   */
  public async checkProposedTransactions(block: ProposedBlock) {
    const transactions = new Map<string, TransactionDto>();
    for (const transaction of block.transactions) {
      await this.checkTransaction(transaction, transactions);
      const hash = this.hashTransactionValue(transaction);
      transactions.set(hash, transaction);
    }
  }

  /**
   * Checks if the blocks version is correct.
   * @param block
   */
  private checkVersion(block: ProposedBlock) {
    if (this.hashService.blockVersion !== block.version) {
      throw new Error(
        `Version incorrect: ${JSON.stringify({
          is: block.version,
          should: this.hashService.blockVersion,
        })}`,
      );
    }
  }

  /**
   * Checks the amount of required signatures. Queries the required signatures and compares them with the given ones.
   * @param transaction
   */
  private checkAmountOfSignatures(transaction: TransactionDto) {
    const required = this.types.get(transaction.body.type)!.signatureAmount();
    const signatures = this.types
      .get(transaction.body.type)!
      .signature(transaction);
    if (signatures.length < required) {
      throw new Error('signatures are missing');
    }
  }

  /**
   * Checks if the given transaction is valid. Collect the validations into an array to validate them in the end.
   * @param transaction
   * @param addedTransactions
   */
  public async checkTransaction(
    transaction: TransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ): Promise<any[]> {
    return Promise.all([
      this.checkSignature(transaction),
      this.checkSize(transaction),
      this.types
        .get(transaction.body.type)!
        .validation(transaction, addedTransactions),
    ]);
  }

  /**
   * Checks the size of a transaction to prevent an overflow.
   */
  private checkSize(transaction: TransactionDto) {
    // TODO validate logic
    const maxSize = 1000000;
    const size = new TextEncoder().encode(JSON.stringify(transaction)).length;
    if (size > maxSize) {
      throw new Error(`transaction is too big: ${size} byte > ${maxSize}`);
    }
    return Promise.resolve();
  }

  /**
   * Checks if the transaction:
   * - is signed with a valid key
   * - by an authorized participant
   * - no double signatures by same issuer
   * - has enough signatures
   * @param transaction
   */
  private async checkSignature(transaction: TransactionDto) {
    const hash = this.hashTransactionValue(transaction);
    const signatures = this.getSignatures(transaction);
    const usedSignatures: string[] = [];
    this.checkAmountOfSignatures(transaction);
    for (const signature of signatures) {
      const cert = await this.didCachedService.getKey(signature.identifier);
      const correctSignature = await this.walletClientService.checkSignature(
        cert.publicKeyJwk,
        hash,
        signature.signature,
      );
      if (!correctSignature) {
        throw new Error(`Signature is invalid for: ${signature.identifier}`);
      }
      if (usedSignatures.includes(signature.identifier)) {
        throw new Error(
          `Transaction multiple singed by same issuer: ${signature.identifier}`,
        );
      }
      usedSignatures.push(signature.identifier);
    }
  }

  /**
   * Creates a hash of the transaction's important values.
   * @param transaction
   */
  private hashTransactionValue(transaction: TransactionDto) {
    return this.types.get(transaction.body.type)!.hash(transaction);
  }

  /**
   * Returns the signatures of a transaction.
   * @param transaction
   */
  private getSignatures(transaction: TransactionDto): SignatureDto[] {
    return this.types.get(transaction.body.type)!.signature(transaction);
  }
}
