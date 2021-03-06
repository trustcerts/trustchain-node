import {
  BLOCKS_REQUEST,
  BLOCK_COUNTER,
  BLOCK_REQUEST,
} from '@tc/clients/persist-client/constants';
import { BLOCK_PERSIST } from './constants';
import { Block } from '@tc/blockchain/block/block.interface';
import { Controller, Inject } from '@nestjs/common';
import { EventPattern, MessagePattern, Transport } from '@nestjs/microservices';
import { Logger } from 'winston';
import { PersistService } from './persist.service';
import { SYSTEM_RESET } from '@tc/clients/event-client/constants';

/**
 * Endpoint to interact with other services inside a node.
 */
@Controller()
export class PersistController {
  /**
   * Registers required services.
   * @param persistService
   * @param client
   * @param logger
   */
  constructor(
    private readonly persistService: PersistService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Stores a now block that was emitted by the network service.
   * @param block
   */
  @MessagePattern(BLOCK_PERSIST, Transport.TCP)
  blockCreated(block: Block) {
    this.logger.info({
      message: `persist block: ${block.index}`,
      labels: { source: this.constructor.name },
    });
    this.persistService.setBlock(block);
  }

  /**
   * Returns a block with the given id.
   * @param blockId
   */
  @MessagePattern(BLOCK_REQUEST, Transport.TCP)
  getBlock(blockId: number): Block {
    return this.persistService.getBlock(blockId);
  }

  /**
   * Returns an array of blocks of the chain, defined by the start point and the length.
   * @param values
   */
  @MessagePattern(BLOCKS_REQUEST, Transport.TCP)
  getBlocks(values: { start: number; size: number }): Block[] {
    return this.persistService.getBlocks(values.start, values.size);
  }

  /**
   * Returns current amount of blocks.
   */
  @MessagePattern(BLOCK_COUNTER, Transport.TCP)
  getBlockCounter(): number {
    return this.persistService.blockCounter;
  }

  /**
   * Resets the system when the signal is emitted.
   */
  @EventPattern(SYSTEM_RESET, Transport.REDIS)
  reset() {
    this.logger.debug({
      message: `reset`,
      labels: { source: this.constructor.name },
    });
    this.persistService.clearBlockchain();
  }
}
