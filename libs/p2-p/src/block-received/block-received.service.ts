import { Block } from '@tc/blockchain/block/block.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { ParseClientService } from '@tc/parse-client/parse-client.service';
import { PersistClientService } from '@tc/persist-client/persist-client.service';

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
    return new Promise((resolve, reject) => {
      this.logger.debug({
        message: `got new block: ${block.index}`,
        labels: { source: this.constructor.name },
      });
      this.persistClientService.setBlock(block).subscribe({
        complete: () => {
          this.logger.debug({
            message: `persisted block: ${block.index}`,
            labels: { source: this.constructor.name },
          });
          this.parseClientService.parseBlock(block).subscribe({
            complete: () => {
              this.logger.debug({
                message: `parsed block: ${block.index}`,
                labels: { source: this.constructor.name },
              });
              resolve();
            },
            error: () => {
              this.logger.warn({
                message: `block ${block.index} not parsed in given time`,
                labels: { source: this.constructor.name },
              });
              reject(`block ${block.index} not parsed in given time`);
            },
          });
        },
        error: (err) => {
          console.log(err);
          reject(`block ${block.index} not persisted in given time`);
        },
      });
    });
  }
}
