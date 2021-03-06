import { Block } from '@tc/blockchain/block/block.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { ParseClientService } from '@tc/clients/parse-client/parse-client.service';
import { PersistClientService } from '@tc/clients/persist-client/persist-client.service';

/**
 * Responsible to share new blocks to the internal services.
 */
@Injectable()
export class BlockReceivedService {
  /**
   * Inject required services.
   * @param clientRedis
   * @param logger
   * @param persistTCpClient
   */
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly persistClientService: PersistClientService,
    private readonly parseClientService: ParseClientService,
  ) {}

  /**
   * Returns a resolved promise when the block got persisted and parsed.
   * @param block
   */
  async addBlock(block: Block): Promise<void> {
    this.logger.debug({
      message: `got new block: ${block.index}`,
      labels: { source: this.constructor.name },
    });
    await this.persistClientService.setBlock(block).catch(() => {
      throw new Error(`block ${block.index} not persisted in given time`);
    });
    this.logger.debug({
      message: `persisted block: ${block.index}`,
      labels: { source: this.constructor.name },
    });
    await this.parseClientService.parseBlock(block).catch(() => {
      this.logger.warn({
        message: `block ${block.index} not parsed in given time`,
        labels: { source: this.constructor.name },
      });
      throw new Error(`block ${block.index} not parsed in given time`);
    });
    this.logger.debug({
      message: `parsed block: ${block.index}`,
      labels: { source: this.constructor.name },
    });
  }
}
