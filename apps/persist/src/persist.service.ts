import * as fs from 'fs';
import { Block } from '@tc/blockchain/block/block.interface';
import { ConfigService } from '@tc/config';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * Service to organize the chain.
 */
@Injectable()
export class PersistService {
  /**
   * Path to the blockchain.
   */
  private path = `${this.configService.storagePath}/bc`;

  /**
   * Constructor to add a ChainService
   * @param configService
   * @param promBlockCounter
   */
  constructor(
    private readonly configService: ConfigService,
    @InjectMetric('blockchainLength') private promBlockCounter: Counter<string>,
  ) {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path);
    }
    this.promBlockCounter.inc(this.blockCounter);
  }

  /**
   * Returns the amount of blocks that are locally stored.
   */
  get blockCounter(): number {
    const files = fs.readdirSync(`${this.path}`);
    return files.length;
  }

  /**
   * Persist a given block.
   * @param block given block
   */
  setBlock(block: Block): void {
    fs.writeFileSync(`${this.path}/${block.index}.json`, JSON.stringify(block));
    this.promBlockCounter.inc();
  }

  /**
   * Returns the latest block in the chain.
   */
  latestBlock(): Block | void {
    const latestIndex = this.blockCounter;
    if (latestIndex) {
      return this.getBlock(latestIndex);
    }
  }

  /**
   * Get the block at a given index.
   * @param index given index
   */
  getBlock(index: number): Block {
    try {
      const file = fs.readFileSync(`${this.path}/${index}.json`, 'utf8');
      return JSON.parse(file);
    } catch (e) {
      throw new NotFoundException(`block ${index} not found`);
    }
  }

  /**
   * Get array of blocks beginning at a defined index.
   * @param start
   * @param size
   */
  getBlocks(start: any, size: any): Block[] {
    const blocks = [];
    let index = start;
    while (index < start + size && this.blockCounter >= index) {
      const block = this.getBlock(index);
      if (block) {
        blocks.push(block);
        index++;
      } else {
        index += size;
      }
    }
    return blocks;
  }

  /**
   * Deletes the blockchain of this node.
   */
  public clearBlockchain() {
    const path = `${this.configService.storagePath}/bc`;
    const files = fs.readdirSync(path);
    files.forEach((file) => {
      fs.unlinkSync(path.concat('/', file));
    });
    this.promBlockCounter.reset();
  }
}
