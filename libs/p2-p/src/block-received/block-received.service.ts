import { BLOCK_CREATED, REDIS_INJECTION } from '@tc/event-client/constants';
import { Block } from '@tc/blockchain/block/block.interface';
import { ClientRedis } from '@nestjs/microservices';
import { EventEmitter } from 'events';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';

/**
 * Responsible to share new blocks to the internal services.
 */
@Injectable()
export class BlockReceivedService {
  /**
   * Event when a new block was parsed.
   */
  public parsed = new EventEmitter();

  /**
   * Timeout when the add block event will be rejected.
   */
  private parsingTimeout = 5000;

  /**
   * Inject required services.
   * @param clientRedis
   * @param logger
   */
  constructor(
    @Inject(REDIS_INJECTION) private readonly clientRedis: ClientRedis,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Adds block to the database and chain and fire a new event. Returns a resolved promise when the block got parsed.
   * @param block
   */
  async addBlock(block: Block): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.debug({
        message: `got new block: ${block.index}`,
        labels: { source: this.constructor.name },
      });
      this.parsed.on(`block-${block.index}`, () => {
        this.logger.debug({
          message: `parsed block: ${block.index}`,
          labels: { source: this.constructor.name },
        });
        clearTimeout(timeout);
        this.parsed.removeAllListeners(`block-${block.index}`);
        resolve();
      });
      // TODO validate block based on validation level
      this.clientRedis.emit(BLOCK_CREATED, block);
      const timeout = setTimeout(() => {
        this.parsed.removeAllListeners(`block-${block.index}`);
        this.logger.warn({
          message: `block ${block.index} not parsed in given time`,
          labels: { source: this.constructor.name },
        });
        reject(`block ${block.index} not parsed in given time`);
      }, this.parsingTimeout);
    });
  }
}
