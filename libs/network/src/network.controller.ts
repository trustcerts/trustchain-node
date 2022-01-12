import { BLOCK_PARSED } from 'libs/clients/event-client/src/constants';
import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { Logger } from 'winston';
import { NetworkService } from '@tc/network/network.service';

/**
 * Internal endpoint of the node.
 */
@Controller('network')
export class NetworkController {
  /**
   * Inject required services.
   * @param networkService
   * @param logger
   */
  constructor(
    private readonly networkService: NetworkService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Event when a new block was parsed by the parse service.
   * @param blockId
   */
  @EventPattern(BLOCK_PARSED, Transport.REDIS)
  blockParsed(blockId: number) {
    this.networkService.parsed.emit(`block-${blockId}`);
  }
}
