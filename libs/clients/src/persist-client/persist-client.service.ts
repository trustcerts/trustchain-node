import {
  BLOCKS_REQUEST,
  BLOCK_COUNTER,
  BLOCK_REQUEST,
  PERSIST_TCP_INJECTION,
} from './constants';
import { BLOCK_PERSIST } from '@apps/persist/src/constants';
import { Block } from '@tc/blockchain/block/block.interface';
import { ClientTCP } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { timeout } from 'rxjs';

/**
 * Client to interact with the service that is responsible for the persist actions.
 */
@Injectable()
export class PersistClientService {
  /**
   * timeout in ms when to cancel the persist request.
   */
  private persistTimeout = 2000;

  /**
   * Inject required services.
   * @param clientTCP
   */
  constructor(
    @Inject(PERSIST_TCP_INJECTION) private readonly clientTCP: ClientTCP,
  ) {}

  /**
   * Returns the current block counter.
   */
  getBlockCounter(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.clientTCP
        .send<number>(BLOCK_COUNTER, {})
        .pipe(timeout(this.persistTimeout))
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
  }

  /**
   * Returns the block with the given index.
   * @param index
   */
  setBlock(block: Block): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientTCP
        .send(BLOCK_PERSIST, block)
        .pipe(timeout(this.persistTimeout))
        .subscribe({
          error: reject,
          complete: resolve,
        });
    });
  }

  /**
   * Returns the block with the given index.
   * @param index
   */
  getBlock(index: number): Promise<Block> {
    return new Promise((resolve, reject) => {
      this.clientTCP
        .send<Block>(BLOCK_REQUEST, index)
        .pipe(timeout(this.persistTimeout))
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
  }

  /**
   * Returns an array of blocks defined by start and length.
   * @param start
   * @param size
   */
  getBlocks(start: number, size: number): Promise<Block[]> {
    return new Promise((resolve, reject) => {
      this.clientTCP
        .send<Block[]>(BLOCKS_REQUEST, { start, size })
        .pipe(timeout(this.persistTimeout))
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
  }

  /**
   * Returns the latest block. Rejects the promise if no block was sent.
   */
  latestBlock(): Promise<Block> {
    return this.getBlockCounter().then((counter) => {
      if (counter === 0) {
        throw Error('no blocks founds');
      }
      return this.getBlock(counter);
    });
  }
}
