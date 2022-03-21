import { BLOCK_PARSE, CHAIN_REBUILD } from '@tc/parse-client/constants';
import { Block } from '@tc/blockchain/block/block.interface';
import { Controller, Inject } from '@nestjs/common';
import { EventPattern, MessagePattern, Transport } from '@nestjs/microservices';
import { Logger } from 'winston';
import { ParseService } from './parse.service';
import { ParsingService } from '@tc/transactions/transactions/parsing.service';
import { SYSTEM_RESET } from '@tc/event-client/constants';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
/**
 * Internal endpoint to interact with the parse service.
 */
@Controller()
export class ParseController {
  /**
   * Inject required services.
   * @param appService
   * @param client
   * @param logger
   */
  constructor(
    private readonly appService: ParseService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Listens for new blocks and parses them. Emits an event when the job is done.
   * @param block
   */
  @MessagePattern(BLOCK_PARSE, Transport.TCP)
  async blockParse(block: Block) {
    this.logger.info({
      message: `parse block: ${block.index}`,
      labels: { source: this.constructor.name },
    });
    await this.appService.parseBlock(block);
    this.logger.info({
      message: `parsed block: ${block.index}`,
      labels: { source: this.constructor.name },
    });
  }

  /**
   * Listens to the event to rebuild the chain.
   */
  @MessagePattern(CHAIN_REBUILD, Transport.TCP)
  async rebuild() {
    this.logger.info({
      message: `rebuild`,
      labels: { source: this.constructor.name },
    });
    await this.appService.rebuild();
  }

  /**
   * Listens to the event to reset the service.
   */
  @EventPattern(SYSTEM_RESET, Transport.REDIS)
  async reset() {
    this.logger.info({
      message: `reset`,
      labels: { source: this.constructor.name },
    });
    if (existsSync(join(ParsingService.shared_storage, 'tmp'))) {
      rmSync(join(ParsingService.shared_storage, 'tmp'), { recursive: true });
    }
    await this.appService.reset();
  }
}
