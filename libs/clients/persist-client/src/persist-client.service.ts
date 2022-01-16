import {
  BLOCKS_REQUEST,
  BLOCK_COUNTER,
  BLOCK_REQUEST,
} from '@tc/event-client/constants';
import { Block } from '@tc/blockchain/block/block.interface';
import { ClientTCP } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { PERSIST_TCP_INJECTION } from './constants';
import { lastValueFrom } from 'rxjs';

/**
 * Client to interact with the service that is responsible for the persist actions.
 */
@Injectable()
export class PersistClientService {
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
  async getBlockCounter(): Promise<number> {
    return lastValueFrom(this.clientTCP.send<number>(BLOCK_COUNTER, {}));
  }

  /**
   * Returns the block with the given index.
   * @param index
   */
  async getBlock(index: number): Promise<Block> {
    return lastValueFrom(this.clientTCP.send<Block>(BLOCK_REQUEST, index));
  }

  /**
   * Returns an array of blocks defined by start and length.
   * @param start
   * @param size
   */
  async getBlocks(start: number, size: number): Promise<Block[]> {
    return lastValueFrom(
      this.clientTCP.send<Block[]>(BLOCKS_REQUEST, { start, size }),
    );
  }

  /**
   * Returns the latest block. Rejects the promise if no block was sent.
   */
  async latestBlock(): Promise<Block> {
    const latest = await this.getBlockCounter();
    if (latest === 0) {
      return Promise.reject();
    }
    return this.getBlock(latest);
  }
}
