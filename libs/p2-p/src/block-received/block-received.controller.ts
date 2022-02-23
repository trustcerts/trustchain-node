import { BLOCK_PARSED } from '@tc/event-client/constants';
import { BlockReceivedService } from './block-received.service';
import { Controller } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';

/**
 * Listens to events after a block got persisted.
 */
@Controller('block-received')
export class BlockReceivedController {
  /**
   * import required services
   * @param blockReceviedService
   */
  constructor(private readonly blockReceviedService: BlockReceivedService) {}
  /**
   * Event when a new block was parsed by the parse service.
   * @param blockId
   */
  @EventPattern(BLOCK_PARSED, Transport.REDIS)
  blockParsed(blockId: number) {
    // TODO also listen for the persisted event
    this.blockReceviedService.parsed.emit(`block-${blockId}`);
  }
}
