import { Block } from '@tc/blockchain/block/block.interface';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { Parser } from './parser.interface';
import { PersistClientService } from '@tc/clients/persist-client';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Interacts with the database on low level. Only resets the database or emits new transactions that will be handled by registered listeners.
 */
@Injectable()
export class ParseService {
  /**
   * Includes a function pointer how to parse a special type of transaction.
   */
  public parsers: Map<TransactionType, Parser> = new Map<
    TransactionType,
    Parser
  >();

  /**
   * Import required services.
   * @param logger
   * @param persistClientService
   */
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly persistClientService: PersistClientService,
  ) {}

  /**
   * Resets the registered modules by deleting the modules.
   * @returns
   */
  public reset() {
    return Promise.all(
      Array.from(this.parsers.values()).map((parser) => parser.reset()),
    );
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
  public parseBlock(block: Block): Promise<void[]> {
    return Promise.all(
      block.transactions.map((transaction) => {
        transaction.block = {
          id: block.index,
          createdAt: block.timestamp,
          validators: [
            block.proposer.identifier,
            ...block.signatures.map((signature) => signature.identifier),
          ],
        };
        const parser = this.parsers.get(transaction.body.type);
        if (!parser) {
          throw Error(
            `no parser found for transaction type ${transaction.body.type}`,
          );
        }
        return parser.parsing(transaction);
      }),
    );
  }
}
