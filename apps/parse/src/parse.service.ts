import { Block } from '@tc/blockchain/block/block.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParsingService } from '@tc/parsing';
import { PersistClientService } from 'libs/clients/persist-client/src';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Interacts with the database on low level. Only resets the database or emits new transactions that will be handled by registered listeners.
 */
@Injectable()
export class ParseService {
  /**
   * Modules that will be registered by the loaded modules to reset them.
   */
  public modules: Model<any>[] = [];

  /**
   * Import required services.
   * @param logger
   * @param persistClientService
   * @param hashCachedService
   * @param securityCachedService
   * @param didCachedService
   * @param parsingService
   */
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly persistClientService: PersistClientService,
    private readonly parsingService: ParsingService,
  ) {}

  /**
   * Resets the registered modules by deleting the modules.
   * @returns
   */
  public reset() {
    // TODO since all entries are based on uuids there is no increment that has to be reset.
    return Promise.all(this.modules.map((module) => module.deleteMany({})));
  }

  /**
   * Rebuilds the service.
   */
  async rebuild() {
    await this.reset();
    const maxCounter = await this.persistClientService.getBlockCounter();
    let counter = 0;
    try {
      while (maxCounter > counter) {
        counter++;
        const block = await this.persistClientService.getBlock(counter);
        await this.parseBlock(block);
        this.logger.info({
          message: `parsed block: ${block.index}`,
          labels: { source: this.constructor.name },
        });
      }
      if (counter === maxCounter) {
        this.logger.info({
          message: 'finished rebuild',
          labels: { source: this.constructor.name },
        });
      }
    } catch (e: any) {
      this.logger.error({
        message: `failed parsing block ${counter} reason: ${e.message}`,
        labels: { source: this.constructor.name },
      });
    }
  }

  /**
   * Informs other nodes about a block ready for cert-parsing.
   * @param block block that is ready for cert-parsing
   */
  public parseBlock(block: Block): Promise<void> {
    return new Promise((resolve) => {
      let parsed = 0;
      this.parsingService.emitter.on(`block-${block.index}`, () => {
        parsed++;
        if (parsed === block.transactions.length) {
          this.parsingService.emitter.removeAllListeners(
            `block-${block.index}`,
          );
          resolve();
        }
      });
      block.transactions.forEach((transaction) => {
        transaction.block = {
          id: block.index,
          createdAt: block.timestamp,
          validators: [
            block.proposer.identifier,
            ...block.signatures.map((signature) => signature.identifier),
          ],
        };
        this.parsingService.emitter.emit(
          TransactionType[transaction.body.type],
          transaction,
        );
      });
    });
  }
}
